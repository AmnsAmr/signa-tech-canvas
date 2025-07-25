import os
import xml.etree.ElementTree as ET
import re
import math
from pathlib import Path
import fitz  # PyMuPDF
import ezdxf
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union
import svgpathtools

class VectorProcessor:
    def __init__(self):
        self.units = 'mm'
        # Conversion factors to mm
        self.unit_conversions = {
            'mm': 1.0,
            'points': 0.352778,  # 1 point = 0.352778 mm
            'px': 0.264583,      # 1 px = 0.264583 mm (96 DPI)
            'in': 25.4,          # 1 inch = 25.4 mm
            'cm': 10.0           # 1 cm = 10 mm
        }
    
    def analyze_file(self, file_path, filename):
        """Main analysis function that routes to appropriate processor"""
        ext = Path(filename).suffix.lower()
        
        try:
            if ext == '.svg':
                return self._analyze_svg(file_path, filename)
            elif ext == '.dxf':
                return self._analyze_dxf(file_path, filename)
            elif ext == '.pdf':
                return self._analyze_pdf(file_path, filename)
            elif ext == '.eps':
                return self._analyze_eps(file_path, filename)
            else:
                raise ValueError(f"Unsupported file format: {ext}")
        except Exception as e:
            return {
                'fileName': filename,
                'error': str(e),
                'paperArea': 'Unknown',
                'letterArea': 0,
                'pathLength': 0,
                'shapes': []
            }
    
    def _analyze_svg(self, file_path, filename):
        """Analyze SVG file using svgpathtools with improved unit handling and area accuracy"""
        try:
            paths, attributes = svgpathtools.svg2paths(file_path)

            # Get SVG dimensions and units
            tree = ET.parse(file_path)
            root = tree.getroot()
            svg_ns = '{http://www.w3.org/2000/svg}'
            width_attr = root.get('width')
            height_attr = root.get('height')
            viewbox = root.get('viewBox')
            svg_unit = 'px'  # Default SVG unit

            def extract_unit(val):
                if val is None:
                    return None, 'px'
                m = re.match(r"([\d.]+)([a-z%]*)", val.strip())
                if m:
                    num, unit = m.groups()
                    return float(num), unit if unit else 'px'
                return float(val), 'px'

            if width_attr and height_attr:
                width, width_unit = extract_unit(width_attr)
                height, height_unit = extract_unit(height_attr)
                svg_unit = width_unit if width_unit == height_unit else 'px'
            elif viewbox:
                _, _, width, height = map(float, viewbox.split())
                svg_unit = 'px'
            else:
                width, width_unit = 100, 'px'
                height, height_unit = 100, 'px'
                svg_unit = 'px'

            width_mm = self._convert_to_mm(width, svg_unit)
            height_mm = self._convert_to_mm(height, svg_unit)
            paper_area = f"{width_mm:.2f}x{height_mm:.2f} mm"

            # Analyze paths
            total_length = 0
            total_area = 0
            shapes = []
            warnings = []

            for i, path in enumerate(paths):
                try:
                    length = path.length()
                    total_length += length
                    area = 0
                    if hasattr(path, 'isclosed') and path.isclosed():
                        # Use svgpathtools' area if available (signed area, may be negative)
                        try:
                            area = abs(path.area())
                        except Exception:
                            # Fallback to polygon sampling if area() fails
                            points = [(path.point(t).real, path.point(t).imag) for t in [j/199.0 for j in range(200)]]
                            if len(points) > 2:
                                try:
                                    poly = Polygon(points)
                                    area = abs(poly.area)
                                except Exception as e:
                                    warnings.append(f"Path {i+1} area calc failed: {str(e)}")
                                    area = 0
                        total_area += area
                    # Convert to mm
                    length_mm = self._convert_to_mm(length, svg_unit)
                    area_mm = self._convert_to_mm(area, svg_unit) * self._convert_to_mm(1, svg_unit)
                    shapes.append({
                        'name': f'Path {i+1}',
                        'length': f"{length_mm:.2f} mm",
                        'area': f"{area_mm:.2f} mm²" if area > 0 else "Open path (no area)"
                    })
                except Exception as e:
                    warnings.append(f"Path {i+1} failed: {str(e)}")
            # Convert totals to mm
            total_length_mm = self._convert_to_mm(total_length, svg_unit)
            total_area_mm = self._convert_to_mm(total_area, svg_unit) * self._convert_to_mm(1, svg_unit)
            result = {
                'fileName': filename,
                'paperArea': paper_area,
                'letterArea': f"{total_area_mm:.2f} mm²",
                'pathLength': f"{total_length_mm:.2f} mm",
                'shapes': shapes,
                'units': 'mm'
            }
            if warnings:
                result['warnings'] = warnings
            return result
        except Exception as e:
            raise Exception(f"SVG analysis failed: {str(e)}")
    
    def _analyze_dxf(self, file_path, filename):
        """Analyze DXF file using ezdxf"""
        try:
            doc = ezdxf.readfile(file_path)
            msp = doc.modelspace()
            
            # Get drawing extents
            extents = msp.extents()
            if extents:
                width = extents[1][0] - extents[0][0]
                height = extents[1][1] - extents[0][1]
                # DXF units are typically mm, but convert for consistency
                paper_area = f"{width:.2f}x{height:.2f} mm"
            else:
                paper_area = "Unknown"
            
            total_length = 0
            total_area = 0
            shapes = []
            shape_count = 0
            
            # Process entities
            for entity in msp:
                shape_count += 1
                length = 0
                area = 0
                
                if entity.dxftype() == 'LINE':
                    start = entity.dxf.start
                    end = entity.dxf.end
                    length = math.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2)
                
                elif entity.dxftype() == 'CIRCLE':
                    radius = entity.dxf.radius
                    length = 2 * math.pi * radius  # Circumference
                    area = math.pi * radius**2
                
                elif entity.dxftype() == 'ARC':
                    radius = entity.dxf.radius
                    start_angle = math.radians(entity.dxf.start_angle)
                    end_angle = math.radians(entity.dxf.end_angle)
                    angle_diff = end_angle - start_angle
                    if angle_diff < 0:
                        angle_diff += 2 * math.pi
                    length = radius * angle_diff
                
                elif entity.dxftype() == 'LWPOLYLINE':
                    points = list(entity.get_points())
                    if len(points) > 1:
                        for i in range(len(points) - 1):
                            dx = points[i+1][0] - points[i][0]
                            dy = points[i+1][1] - points[i][1]
                            length += math.sqrt(dx**2 + dy**2)
                        
                        # If closed, calculate area
                        if entity.closed and len(points) > 2:
                            try:
                                poly = Polygon([(p[0], p[1]) for p in points])
                                area = abs(poly.area)
                            except:
                                area = 0
                
                if length > 0 or area > 0:
                    total_length += length
                    total_area += area
                    shapes.append({
                        'name': f'{entity.dxftype()} {shape_count}',
                        'length': f"{length:.2f} mm",
                        'area': f"{area:.2f} mm²" if area > 0 else "Open path (no area)"
                    })
            
            return {
                'fileName': filename,
                'paperArea': paper_area,
                'letterArea': f"{total_area:.2f} mm²",
                'pathLength': f"{total_length:.2f} mm",
                'shapes': shapes,
                'units': 'mm'
            }
            
        except Exception as e:
            raise Exception(f"DXF analysis failed: {str(e)}")
    
    def _analyze_pdf(self, file_path, filename):
        """Analyze PDF file using PyMuPDF"""
        try:
            doc = fitz.open(file_path)
            page = doc[0]  # Analyze first page
            
            # Get page dimensions
            rect = page.rect
            width = rect.width
            height = rect.height
            # Convert PDF points to mm
            width_mm = self._convert_to_mm(width, 'points')
            height_mm = self._convert_to_mm(height, 'points')
            paper_area = f"{width_mm:.2f}x{height_mm:.2f} mm"
            
            # Get vector paths
            paths = page.get_drawings()
            total_length = 0
            total_area = 0
            shapes = []
            
            for i, path in enumerate(paths):
                length = 0
                area = 0
                
                # Calculate path length
                for item in path['items']:
                    if item[0] == 'l':  # Line
                        p1, p2 = item[1], item[2]
                        length += math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
                    elif item[0] == 'c':  # Curve - approximate
                        p1, p2, p3, p4 = item[1], item[2], item[3], item[4]
                        # Approximate curve length
                        length += (math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2) +
                                 math.sqrt((p3.x - p2.x)**2 + (p3.y - p2.y)**2) +
                                 math.sqrt((p4.x - p3.x)**2 + (p4.y - p3.y)**2))
                
                # Check if path is filled (has area)
                if path.get('fill'):
                    # Approximate area calculation
                    rect = path.get('rect')
                    if rect:
                        area = (rect.x1 - rect.x0) * (rect.y1 - rect.y0)
                
                total_length += length
                total_area += area
                
                # Convert to mm
                length_mm = self._convert_to_mm(length, 'points')
                area_mm = self._convert_to_mm(area, 'points') * self._convert_to_mm(1, 'points')
                
                shapes.append({
                    'name': f'Path {i+1}',
                    'length': f"{length_mm:.2f} mm",
                    'area': f"{area_mm:.2f} mm²" if area > 0 else "Open path (no area)"
                })
            
            doc.close()
            
            # Convert totals to mm
            total_length_mm = self._convert_to_mm(total_length, 'points')
            total_area_mm = self._convert_to_mm(total_area, 'points') * self._convert_to_mm(1, 'points')
            
            return {
                'fileName': filename,
                'paperArea': paper_area,
                'letterArea': f"{total_area_mm:.2f} mm²",
                'pathLength': f"{total_length_mm:.2f} mm",
                'shapes': shapes,
                'units': 'mm'
            }
            
        except Exception as e:
            raise Exception(f"PDF analysis failed: {str(e)}")
    
    def _analyze_eps(self, file_path, filename):
        """Enhanced EPS analysis by parsing PostScript commands"""
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
            
            # Extract bounding box
            bbox_match = re.search(r'%%BoundingBox:\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)', content)
            if bbox_match:
                x1, y1, x2, y2 = map(float, bbox_match.groups())
                width = abs(x2 - x1)
                height = abs(y2 - y1)
                # Convert EPS points to mm
                width_mm = self._convert_to_mm(width, 'points')
                height_mm = self._convert_to_mm(height, 'points')
                paper_area = f"{width_mm:.2f}x{height_mm:.2f} mm"
            else:
                paper_area = "Unknown"
            
            # Parse PostScript path commands more accurately
            shapes = []
            total_length = 0
            total_area = 0
            
            # Split content into lines and process commands
            lines = content.split('\n')
            current_path = []
            path_count = 0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Look for coordinate pairs followed by commands
                tokens = line.split()
                i = 0
                while i < len(tokens):
                    try:
                        # Check for moveto command
                        if i + 2 < len(tokens) and tokens[i + 2] in ['m', 'moveto']:
                            x, y = float(tokens[i]), float(tokens[i + 1])
                            if current_path:  # Finish previous path
                                path_count += 1
                                length = self._calculate_path_length(current_path)
                                total_length += length
                                length_mm = self._convert_to_mm(length, 'points')
                                shapes.append({
                                    'name': f'Path {path_count}',
                                    'length': f"{length_mm:.2f} mm",
                                    'area': 'Open path (no area)'
                                })
                            current_path = [(x, y)]
                            i += 3
                        
                        # Check for lineto command
                        elif i + 2 < len(tokens) and tokens[i + 2] in ['l', 'lineto']:
                            x, y = float(tokens[i]), float(tokens[i + 1])
                            current_path.append((x, y))
                            i += 3
                        
                        # Check for closepath
                        elif tokens[i] in ['closepath', 'cp']:
                            if current_path and len(current_path) > 2:
                                current_path.append(current_path[0])  # Close the path
                                path_count += 1
                                length = self._calculate_path_length(current_path)
                                area = self._calculate_polygon_area(current_path)
                                total_length += length
                                total_area += area
                                length_mm = self._convert_to_mm(length, 'points')
                                area_mm = self._convert_to_mm(area, 'points') * self._convert_to_mm(1, 'points')
                                shapes.append({
                                    'name': f'Closed Path {path_count}',
                                    'length': f"{length_mm:.2f} mm",
                                    'area': f"{area_mm:.2f} mm²" if area > 0 else 'No area'
                                })
                                current_path = []
                            i += 1
                        
                        # Check for stroke/fill commands
                        elif tokens[i] in ['stroke', 'fill', 'S', 'F']:
                            if current_path:
                                path_count += 1
                                length = self._calculate_path_length(current_path)
                                total_length += length
                                area = 0
                                if tokens[i] in ['fill', 'F'] and len(current_path) > 2:
                                    area = self._calculate_polygon_area(current_path)
                                    total_area += area
                                length_mm = self._convert_to_mm(length, 'points')
                                area_mm = self._convert_to_mm(area, 'points') * self._convert_to_mm(1, 'points') if area > 0 else 0
                                shapes.append({
                                    'name': f'Path {path_count}',
                                    'length': f"{length_mm:.2f} mm",
                                    'area': f"{area_mm:.2f} mm²" if area > 0 else 'Open path (no area)'
                                })
                                current_path = []
                            i += 1
                        else:
                            i += 1
                    except (ValueError, IndexError):
                        i += 1
            
            # Handle any remaining path
            if current_path:
                path_count += 1
                length = self._calculate_path_length(current_path)
                total_length += length
                length_mm = self._convert_to_mm(length, 'points')
                shapes.append({
                    'name': f'Path {path_count}',
                    'length': f"{length_mm:.2f} mm",
                    'area': 'Open path (no area)'
                })
            
            # If no paths found, try alternative parsing
            if not shapes:
                # Look for basic drawing commands as fallback
                move_commands = len(re.findall(r'[\d.-]+\s+[\d.-]+\s+m(?:oveto)?', content))
                line_commands = len(re.findall(r'[\d.-]+\s+[\d.-]+\s+l(?:ineto)?', content))
                
                if move_commands > 0 or line_commands > 0:
                    shapes.append({
                        'name': f'PostScript Elements ({move_commands + line_commands})',
                        'length': 'Cannot calculate without coordinates',
                        'area': 'Cannot determine'
                    })
            
            # Convert totals to mm
            total_length_mm = self._convert_to_mm(total_length, 'points') if total_length > 0 else 0
            total_area_mm = self._convert_to_mm(total_area, 'points') * self._convert_to_mm(1, 'points') if total_area > 0 else 0
            
            return {
                'fileName': filename,
                'paperArea': paper_area,
                'letterArea': f"{total_area_mm:.2f} mm²" if total_area_mm > 0 else 'No filled areas',
                'pathLength': f"{total_length_mm:.2f} mm" if total_length_mm > 0 else 'No paths found',
                'shapes': shapes if shapes else [{'name': 'No shapes detected', 'length': 'N/A', 'area': 'N/A'}],
                'units': 'mm'
            }
            
        except Exception as e:
            raise Exception(f"EPS analysis failed: {str(e)}")
    
    def _calculate_path_length(self, path):
        """Calculate total length of a path"""
        if len(path) < 2:
            return 0
        
        total_length = 0
        for i in range(len(path) - 1):
            x1, y1 = path[i]
            x2, y2 = path[i + 1]
            total_length += math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        return total_length
    
    def _calculate_polygon_area(self, path):
        """Calculate area of a polygon using shoelace formula"""
        if len(path) < 3:
            return 0
        
        area = 0
        n = len(path)
        for i in range(n):
            j = (i + 1) % n
            area += path[i][0] * path[j][1]
            area -= path[j][0] * path[i][1]
        return abs(area) / 2
    
    def _parse_dimension(self, dim_str):
        """Parse dimension string and convert to mm"""
        if not dim_str:
            return 100
        
        dim_str = str(dim_str).lower()
        numeric_part = re.findall(r'[\d.]+', dim_str)
        if not numeric_part:
            return 100
            
        value = float(numeric_part[0])
        
        # Detect unit and convert to mm
        if 'mm' in dim_str:
            return value
        elif 'cm' in dim_str:
            return value * 10
        elif 'in' in dim_str:
            return value * 25.4
        elif 'pt' in dim_str or 'point' in dim_str:
            return value * 0.352778
        elif 'px' in dim_str:
            return value * 0.264583
        else:
            # Default assume px for SVG
            return value * 0.264583
    
    def _convert_to_mm(self, value, from_unit):
        """Convert value from given unit to mm"""
        return value * self.unit_conversions.get(from_unit, 1.0)