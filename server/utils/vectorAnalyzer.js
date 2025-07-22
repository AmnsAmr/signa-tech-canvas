/**
 * Vector File Analyzer
 * 
 * This utility analyzes vector files to extract geometric information such as:
 * - Path lengths
 * - Shape areas
 * - Paper/material area
 * 
 * Supports: SVG, DXF, AI, PDF, EPS, GCODE/NC
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Try to load optional dependencies
let paper, svgParser, dxfParser, jsdom;

try {
  // For Node.js environment, we need to use paper-jsdom
  paper = require('paper-jsdom');
  paper.setup(new paper.Size(1000, 1000));
  console.log('Paper.js setup successful');
} catch (e) {
  console.log('Paper.js setup failed:', e.message);
  console.log('SVG processing will be limited.');
  paper = null;
}

try {
  svgParser = require('svg-parser');
  console.log('SVG parser loaded successfully');
} catch (e) {
  console.log('svg-parser not available. Using fallback SVG parsing.');
}

try {
  const DxfParser = require('dxf-parser');
  dxfParser = DxfParser;
  console.log('DXF parser loaded successfully');
} catch (e) {
  console.log('dxf-parser not available. DXF processing will be limited.');
}

/**
 * Main function to analyze a vector file
 * @param {string} filePath - Path to the vector file
 * @param {string} units - Output units ('mm' or 'in')
 * @returns {Object} Analysis results
 */
async function analyzeVectorFile(filePath, units = 'mm') {
  const fileExt = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  
  console.log(`Analyzing vector file: ${fileName} (${fileExt})`);
  
  let result = {
    fileName,
    paperArea: "Unknown",
    letterArea: 0,
    pathLength: 0,
    shapes: [],
    error: null
  };
  
  try {
    // Try to determine the file type by content if possible
    let fileType = fileExt.substring(1).toLowerCase();
    
    // Read the first few bytes to check for magic numbers
    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);
      
      // Check for PDF signature
      if (buffer.toString('ascii', 0, 5) === '%PDF-') {
        fileType = 'pdf';
        console.log('File identified as PDF by signature');
      }
      // Check for SVG XML
      else if (buffer.toString('ascii', 0, 5).includes('<?xml') || 
               fs.readFileSync(filePath, 'utf8', { encoding: 'utf8' }).includes('<svg')) {
        fileType = 'svg';
        console.log('File identified as SVG by content');
      }
      // Check for PostScript
      else if (buffer.toString('ascii', 0, 4) === '%!PS') {
        // Check if it's AI or EPS
        const header = fs.readFileSync(filePath, 'utf8', { encoding: 'utf8', flag: 'r' }).slice(0, 1000);
        if (header.includes('Adobe Illustrator')) {
          fileType = 'ai';
          console.log('File identified as AI by content');
        } else if (header.includes('EPSF')) {
          fileType = 'eps';
          console.log('File identified as EPS by content');
        }
      }
    } catch (e) {
      console.log('Error checking file signature:', e);
      // Continue with extension-based detection
    }
    
    // Process based on determined file type
    switch (fileType) {
      case 'svg':
        result = await analyzeSVG(filePath, units);
        break;
      case 'dxf':
        result = await analyzeDXF(filePath, units);
        break;
      case 'pdf':
        result = await analyzePDF(filePath, units);
        break;
      case 'ai':
      case 'eps':
        result = await analyzeAIorEPS(filePath, units);
        break;
      case 'gcode':
      case 'nc':
        result = await analyzeGCode(filePath, units);
        break;
      default:
        // Try to analyze as SVG first, then fall back to other formats
        try {
          console.log('Trying to analyze as SVG...');
          result = await analyzeSVG(filePath, units);
        } catch (svgError) {
          console.log('SVG analysis failed, trying DXF...');
          try {
            result = await analyzeDXF(filePath, units);
          } catch (dxfError) {
            throw new Error(`Unsupported or unrecognized file format: ${fileExt}`);
          }
        }
        break;
    }
    
    // Add filename to result
    result.fileName = fileName;
    
    // Calculate totals if we have shapes
    if (result.shapes && result.shapes.length > 0) {
      let totalLength = 0;
      let totalArea = 0;
      let hasValidLength = false;
      let hasValidArea = false;
      
      result.shapes.forEach(shape => {
        // Extract numeric values from length and area strings
        const lengthMatch = shape.length.match(/([\d.]+)/);
        const areaMatch = shape.area.match(/([\d.]+)/);
        
        if (lengthMatch) {
          totalLength += parseFloat(lengthMatch[1]);
          hasValidLength = true;
        }
        
        if (areaMatch && !shape.area.includes('Open')) {
          totalArea += parseFloat(areaMatch[1]);
          hasValidArea = true;
        }
      });
      
      // Update the total values if we have valid data
      if (hasValidLength) {
        result.pathLength = `${totalLength.toFixed(2)} ${units}`;
      }
      
      if (hasValidArea) {
        result.letterArea = `${totalArea.toFixed(2)} ${units}²`;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error analyzing ${fileName}:`, error);
    return {
      fileName,
      error: error.message,
      paperArea: "Unknown",
      letterArea: 0,
      pathLength: 0,
      shapes: []
    };
  }
}

/**
 * Analyze SVG file
 */
async function analyzeSVG(filePath, units) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let result = {
    paperArea: "Unknown",
    letterArea: 0,
    pathLength: 0,
    shapes: []
  };
  
  try {
    // Extract viewBox to determine paper area
    const viewBoxMatch = fileContent.match(/viewBox=["']([^"']*)["']/);
    if (viewBoxMatch) {
      const [x, y, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
      result.paperArea = `${width}x${height} ${units}`;
    } else {
      // Try to get width and height attributes
      const widthMatch = fileContent.match(/width=["']([^"']*)["']/);
      const heightMatch = fileContent.match(/height=["']([^"']*)["']/);
      if (widthMatch && heightMatch) {
        let width = widthMatch[1];
        let height = heightMatch[1];
        
        // Convert units if needed
        if (width.includes('mm') && height.includes('mm')) {
          width = parseFloat(width);
          height = parseFloat(height);
          result.paperArea = `${width}x${height} mm`;
        } else {
          result.paperArea = `${width}x${height}`;
        }
      }
    }
    
    // Use Paper.js for accurate analysis if available
    if (paper) {
      console.log('Using Paper.js for SVG analysis');
      try {
        const svg = paper.project.importSVG(fileContent);
        
        // Get document bounds
        const bounds = svg.bounds;
        if (!result.paperArea || result.paperArea === "Unknown") {
          result.paperArea = `${bounds.width.toFixed(2)}x${bounds.height.toFixed(2)} ${units}`;
        }
        
        // Process all paths
        let totalLength = 0;
        let totalArea = 0;
        let shapeIndex = 0;
        
        function processItem(item) {
          if (item.children && item.children.length > 0) {
            item.children.forEach(child => processItem(child));
          }
          
          if (item instanceof paper.Path) {
            const length = item.length;
            totalLength += length;
            
            let area = 0;
            if (item.closed) {
              area = Math.abs(item.area);
              totalArea += area;
            }
            
            result.shapes.push({
              name: `Shape ${++shapeIndex}`,
              length: `${length.toFixed(2)} ${units}`,
              area: item.closed ? `${area.toFixed(2)} ${units}²` : "Open path (no area)"
            });
          }
        }
        
        svg.children.forEach(item => {
          processItem(item);
        });
        
        result.pathLength = `${totalLength.toFixed(2)} ${units}`;
        result.letterArea = `${totalArea.toFixed(2)} ${units}²`;
      } catch (e) {
        console.error('Error using Paper.js for SVG analysis:', e);
        // Fall back to basic parsing
      }
    }
    
    // If we couldn't process with Paper.js or no shapes were found, use basic parsing
    if (!paper || result.shapes.length === 0) {
      console.log('Using basic SVG parsing');
      // Count path elements as a basic metric
      const pathCount = (fileContent.match(/<path/g) || []).length;
      const rectCount = (fileContent.match(/<rect/g) || []).length;
      const circleCount = (fileContent.match(/<circle/g) || []).length;
      const ellipseCount = (fileContent.match(/<ellipse/g) || []).length;
      const polygonCount = (fileContent.match(/<polygon/g) || []).length;
      
      const totalShapes = pathCount + rectCount + circleCount + ellipseCount + polygonCount;
      
      if (totalShapes > 0) {
        result.shapes = [];
        let shapeIndex = 0;
        
        // Add path shapes
        for (let i = 0; i < pathCount; i++) {
          result.shapes.push({
            name: `Path ${i+1}`,
            length: "Estimated",
            area: "Estimated"
          });
        }
        
        // Add rect shapes
        for (let i = 0; i < rectCount; i++) {
          result.shapes.push({
            name: `Rectangle ${i+1}`,
            length: "Estimated",
            area: "Estimated"
          });
        }
        
        // Add circle shapes
        for (let i = 0; i < circleCount; i++) {
          result.shapes.push({
            name: `Circle ${i+1}`,
            length: "Estimated",
            area: "Estimated"
          });
        }
        
        result.pathLength = "Estimated based on shape count";
        result.letterArea = "Estimated based on shape count";
      }
    }
  } catch (error) {
    console.error('Error analyzing SVG:', error);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Analyze DXF file
 */
async function analyzeDXF(filePath, units) {
  const result = {
    paperArea: "Unknown",
    letterArea: 0,
    pathLength: 0,
    shapes: []
  };
  
  try {
    // Check if dxf-parser is available
    if (!dxfParser) {
      try {
        const DxfParser = require('dxf-parser');
        dxfParser = DxfParser;
        console.log('DXF parser loaded successfully');
      } catch (e) {
        console.log('DXF parser not available:', e.message);
        return {
          ...result,
          error: "DXF parser not available. Install dxf-parser package."
        };
      }
    }
    
    const Parser = dxfParser;
    const parser = new Parser();
    const dxfContent = fs.readFileSync(filePath, 'utf8');
    const dxf = parser.parseSync(dxfContent);
    
    // Extract bounds from header if available
    if (dxf.header && dxf.header.$EXTMIN && dxf.header.$EXTMAX) {
      const width = dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x;
      const height = dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y;
      result.paperArea = `${width.toFixed(2)}x${height.toFixed(2)} ${units}`;
    }
    
    // Process entities
    let totalLength = 0;
    let totalArea = 0;
    let shapeIndex = 0;
    
    if (dxf.entities && dxf.entities.length > 0) {
      dxf.entities.forEach(entity => {
        let length = 0;
        let area = 0;
        let isClosed = false;
        let shapeName = `Shape ${++shapeIndex}`;
        
        try {
          switch (entity.type) {
            case 'LINE':
              shapeName = `Line ${shapeIndex}`;
              // Handle different LINE formats
              if (entity.vertices && entity.vertices.length >= 2) {
                // Format with vertices array
                const dx = entity.vertices[1].x - entity.vertices[0].x;
                const dy = entity.vertices[1].y - entity.vertices[0].y;
                length = Math.sqrt(dx*dx + dy*dy);
              } else if (entity.start && entity.end) {
                // Format with start/end points
                const dx = entity.end.x - entity.start.x;
                const dy = entity.end.y - entity.start.y;
                length = Math.sqrt(dx*dx + dy*dy);
              }
              break;
            case 'CIRCLE':
              shapeName = `Circle ${shapeIndex}`;
              if (entity.center && entity.radius) {
                length = 2 * Math.PI * entity.radius;
                area = Math.PI * entity.radius * entity.radius;
                isClosed = true;
              }
              break;
            case 'ARC':
              shapeName = `Arc ${shapeIndex}`;
              if (entity.center && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
                const angleRad = (entity.endAngle - entity.startAngle) * Math.PI / 180;
                length = entity.radius * angleRad;
              }
              break;
            case 'ELLIPSE':
              shapeName = `Ellipse ${shapeIndex}`;
              if (entity.majorAxisEndPoint) {
                // Approximation for ellipse perimeter
                const a = entity.majorAxisEndPoint.x;
                const b = entity.majorAxisEndPoint.y;
                length = 2 * Math.PI * Math.sqrt((a*a + b*b) / 2);
                area = Math.PI * a * b;
                isClosed = true;
              }
              break;
            case 'POLYLINE':
            case 'LWPOLYLINE':
              shapeName = `Polyline ${shapeIndex}`;
              if (entity.vertices && entity.vertices.length > 1) {
                for (let i = 0; i < entity.vertices.length - 1; i++) {
                  const dx = entity.vertices[i+1].x - entity.vertices[i].x;
                  const dy = entity.vertices[i+1].y - entity.vertices[i].y;
                  length += Math.sqrt(dx*dx + dy*dy);
                }
                
                if (entity.closed) {
                  const dx = entity.vertices[0].x - entity.vertices[entity.vertices.length-1].x;
                  const dy = entity.vertices[0].y - entity.vertices[entity.vertices.length-1].y;
                  length += Math.sqrt(dx*dx + dy*dy);
                  isClosed = true;
                  
                  // Calculate area using shoelace formula
                  area = calculatePolygonArea(entity.vertices);
                }
              }
              break;
            case 'SPLINE':
              shapeName = `Spline ${shapeIndex}`;
              // Approximate spline length by summing control point distances
              if (entity.controlPoints && entity.controlPoints.length > 1) {
                for (let i = 0; i < entity.controlPoints.length - 1; i++) {
                  const dx = entity.controlPoints[i+1].x - entity.controlPoints[i].x;
                  const dy = entity.controlPoints[i+1].y - entity.controlPoints[i].y;
                  length += Math.sqrt(dx*dx + dy*dy);
                }
              }
              break;
            default:
              shapeName = `Entity ${shapeIndex} (${entity.type})`;
              break;
          }
          
          totalLength += length;
          if (isClosed) {
            totalArea += area;
          }
          
          result.shapes.push({
            name: shapeName,
            length: `${length.toFixed(2)} ${units}`,
            area: isClosed ? `${area.toFixed(2)} ${units}²` : "Open path (no area)"
          });
        } catch (entityError) {
          console.error(`Error processing DXF entity ${entity.type}:`, entityError);
          // Continue with next entity
        }
      });
    }
    
    result.pathLength = `${totalLength.toFixed(2)} ${units}`;
    result.letterArea = `${totalArea.toFixed(2)} ${units}²`;
    
    return result;
  } catch (error) {
    console.error('DXF parsing error:', error);
    return {
      ...result,
      error: `DXF parsing error: ${error.message}`
    };
  }
}

/**
 * Analyze PDF file (vector-based)
 */
async function analyzePDF(filePath, units) {
  try {
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    
    // Try to extract PDF info using pdftk if available
    let pdfInfo = {};
    try {
      const { stdout } = await execAsync(`pdftk "${filePath}" dump_data`);
      
      // Parse the output
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.startsWith('NumberOfPages:')) {
          pdfInfo.pages = parseInt(line.split(':')[1].trim());
        }
        if (line.startsWith('PageMediaDimensions:')) {
          const dimensions = line.split(':')[1].trim().split(' ');
          if (dimensions.length >= 2) {
            // Convert from PDF points (1/72 inch) to mm if needed
            const width = parseFloat(dimensions[0]);
            const height = parseFloat(dimensions[1]);
            
            if (units === 'mm') {
              pdfInfo.width = (width * 25.4 / 72).toFixed(2);
              pdfInfo.height = (height * 25.4 / 72).toFixed(2);
            } else {
              pdfInfo.width = (width / 72).toFixed(2);
              pdfInfo.height = (height / 72).toFixed(2);
            }
          }
        }
      }
    } catch (e) {
      console.log('pdftk not available, trying alternative method');
      
      // Try using pdfinfo if available
      try {
        const { stdout } = await execAsync(`pdfinfo "${filePath}"`);
        
        // Parse the output
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.startsWith('Pages:')) {
            pdfInfo.pages = parseInt(line.split(':')[1].trim());
          }
          if (line.startsWith('Page size:')) {
            const sizeInfo = line.split(':')[1].trim();
            const match = sizeInfo.match(/([\d.]+) x ([\d.]+)/);
            if (match) {
              // Convert from PDF points (1/72 inch) to mm if needed
              const width = parseFloat(match[1]);
              const height = parseFloat(match[2]);
              
              if (units === 'mm') {
                pdfInfo.width = (width * 25.4 / 72).toFixed(2);
                pdfInfo.height = (height * 25.4 / 72).toFixed(2);
              } else {
                pdfInfo.width = (width / 72).toFixed(2);
                pdfInfo.height = (height / 72).toFixed(2);
              }
            }
          }
        }
      } catch (e) {
        console.log('pdfinfo not available either');
      }
    }
    
    // Try to extract vector data using pdf2svg and then analyze the SVG
    let vectorData = null;
    try {
      // Create a temporary directory for the SVG output
      const tempDir = path.join(require('os').tmpdir(), 'pdf2svg-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      const svgOutputPath = path.join(tempDir, 'output.svg');
      
      // Convert PDF to SVG using pdf2svg or Inkscape
      try {
        console.log('Attempting to convert PDF to SVG using pdf2svg...');
        await execAsync(`pdf2svg "${filePath}" "${svgOutputPath}" 1`);
      } catch (e) {
        console.log('pdf2svg failed, trying Inkscape...');
        try {
          await execAsync(`inkscape "${filePath}" --export-filename="${svgOutputPath}"`);
        } catch (e2) {
          console.log('Inkscape failed too, vector extraction not possible');
          throw new Error('PDF to SVG conversion failed');
        }
      }
      
      // If conversion succeeded, analyze the SVG
      if (fs.existsSync(svgOutputPath)) {
        console.log('Successfully converted PDF to SVG, analyzing vector data...');
        vectorData = await analyzeSVG(svgOutputPath, units);
        
        // Clean up the temporary file
        try {
          fs.unlinkSync(svgOutputPath);
          fs.rmdirSync(tempDir);
        } catch (e) {
          console.log('Failed to clean up temporary files:', e);
        }
      }
    } catch (e) {
      console.log('Failed to extract vector data from PDF:', e);
    }
    
    // Create a more informative result
    const result = {
      fileName: path.basename(filePath),
      paperArea: pdfInfo.width && pdfInfo.height ? 
        `${pdfInfo.width}x${pdfInfo.height} ${units}` : 
        "Unknown (PDF dimensions could not be determined)",
      letterArea: vectorData ? vectorData.letterArea : "Unknown (PDF content analysis not available)",
      pathLength: vectorData ? vectorData.pathLength : "Unknown (PDF path analysis not available)",
      shapes: vectorData ? vectorData.shapes : [],
      fileInfo: {
        size: `${fileSizeInMB} MB`,
        pages: pdfInfo.pages || "Unknown",
        format: "PDF"
      }
    };
    
    // If we couldn't extract vector data but we know the page count, add page entries
    if (!vectorData && pdfInfo.pages && result.shapes.length === 0) {
      for (let i = 1; i <= pdfInfo.pages; i++) {
        result.shapes.push({
          name: `Page ${i}`,
          length: "Unknown (PDF path analysis not available)",
          area: pdfInfo.width && pdfInfo.height ? 
            `${(parseFloat(pdfInfo.width) * parseFloat(pdfInfo.height)).toFixed(2)} ${units}²` : 
            "Unknown"
        });
      }
    }
    
    // If we still have no shapes, add a generic entry
    if (result.shapes.length === 0) {
      result.shapes.push({
        name: "PDF Document",
        length: "Unknown (PDF path analysis not available)",
        area: "Unknown (PDF area analysis not available)"
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing PDF file:', error);
    return {
      fileName: path.basename(filePath),
      paperArea: "Unknown (PDF analysis error)",
      letterArea: "Unknown",
      pathLength: "Unknown",
      shapes: [],
      error: `PDF analysis error: ${error.message}`
    };
  }
}

/**
 * Analyze AI or EPS file
 */
async function analyzeAIorEPS(filePath, units) {
  try {
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    
    // Read the first few KB to try to extract header information
    const fileBuffer = Buffer.alloc(4096);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, fileBuffer, 0, 4096, 0);
    fs.closeSync(fd);
    
    const fileHeader = fileBuffer.toString('utf8', 0, 4096);
    
    // Try to extract bounding box information
    let boundingBox = null;
    const bbMatch = fileHeader.match(/%%BoundingBox:\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/);
    if (bbMatch) {
      const x1 = parseFloat(bbMatch[1]);
      const y1 = parseFloat(bbMatch[2]);
      const x2 = parseFloat(bbMatch[3]);
      const y2 = parseFloat(bbMatch[4]);
      
      // Convert from points (1/72 inch) to mm if needed
      if (units === 'mm') {
        boundingBox = {
          width: ((x2 - x1) * 25.4 / 72).toFixed(2),
          height: ((y2 - y1) * 25.4 / 72).toFixed(2)
        };
      } else {
        boundingBox = {
          width: ((x2 - x1) / 72).toFixed(2),
          height: ((y2 - y1) / 72).toFixed(2)
        };
      }
    }
    
    // Try to determine if it's an AI or EPS file
    const isAI = fileHeader.includes('%!PS-Adobe') && fileHeader.includes('%%Creator: Adobe Illustrator');
    const isEPS = fileHeader.includes('%!PS-Adobe') && fileHeader.includes('EPSF');
    const fileType = isAI ? 'AI' : (isEPS ? 'EPS' : 'Unknown PostScript');
    
    // Try to extract vector data by converting to SVG first
    let vectorData = null;
    try {
      // Create a temporary directory for the SVG output
      const tempDir = path.join(require('os').tmpdir(), 'eps2svg-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      const svgOutputPath = path.join(tempDir, 'output.svg');
      
      // Try to convert using Inkscape
      console.log(`Attempting to convert ${fileType} to SVG using Inkscape...`);
      try {
        await execAsync(`inkscape "${filePath}" --export-filename="${svgOutputPath}"`);
      } catch (e) {
        console.log('Inkscape conversion failed, trying pstoedit...');
        try {
          // Try pstoedit as an alternative
          await execAsync(`pstoedit -f plot-svg "${filePath}" "${svgOutputPath}"`);
        } catch (e2) {
          console.log('pstoedit failed too, vector extraction not possible');
          throw new Error(`${fileType} to SVG conversion failed`);
        }
      }
      
      // If conversion succeeded, analyze the SVG
      if (fs.existsSync(svgOutputPath)) {
        console.log(`Successfully converted ${fileType} to SVG, analyzing vector data...`);
        vectorData = await analyzeSVG(svgOutputPath, units);
        
        // Clean up the temporary file
        try {
          fs.unlinkSync(svgOutputPath);
          fs.rmdirSync(tempDir);
        } catch (e) {
          console.log('Failed to clean up temporary files:', e);
        }
      }
    } catch (e) {
      console.log(`Failed to extract vector data from ${fileType}:`, e);
    }
    
    // Create a more informative result
    const result = {
      fileName: path.basename(filePath),
      paperArea: boundingBox ? 
        `${boundingBox.width}x${boundingBox.height} ${units}` : 
        (vectorData && vectorData.paperArea !== "Unknown" ? vectorData.paperArea : "Unknown (Could not determine dimensions)"),
      letterArea: vectorData ? vectorData.letterArea : "Unknown (Content analysis not available)",
      pathLength: vectorData ? vectorData.pathLength : "Unknown (Path analysis not available)",
      shapes: vectorData ? vectorData.shapes : [],
      fileInfo: {
        size: `${fileSizeInMB} MB`,
        format: fileType
      }
    };
    
    // If we couldn't extract vector data, add a generic shape entry
    if (!vectorData || result.shapes.length === 0) {
      result.shapes.push({
        name: `${fileType} Document`,
        length: "Unknown (Path analysis not available)",
        area: boundingBox ? 
          `${(parseFloat(boundingBox.width) * parseFloat(boundingBox.height)).toFixed(2)} ${units}²` : 
          "Unknown"
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing AI/EPS file:', error);
    return {
      fileName: path.basename(filePath),
      paperArea: "Unknown (AI/EPS analysis error)",
      letterArea: "Unknown",
      pathLength: "Unknown",
      shapes: [],
      error: `AI/EPS analysis error: ${error.message}`
    };
  }
}

/**
 * Analyze G-code file
 */
async function analyzeGCode(filePath, units) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    let result = {
      paperArea: "Unknown",
      letterArea: 0,
      pathLength: 0,
      shapes: []
    };
    
    let totalLength = 0;
    let currentX = 0, currentY = 0, currentZ = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let shapeIndex = 0;
    let currentShape = {
      name: `Path ${++shapeIndex}`,
      length: 0,
      area: "Open path (no area)"
    };
    
    // Track if we're currently in a cutting operation
    let isCutting = false;
    let currentFeedrate = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith(';') || trimmedLine.startsWith('(') || trimmedLine === '') continue;
      
      // Extract feedrate if present
      const fMatch = trimmedLine.match(/F([-+]?[0-9]*\.?[0-9]+)/i);
      if (fMatch) {
        currentFeedrate = parseFloat(fMatch[1]);
      }
      
      // Look for G0/G1/G2/G3 movement commands
      if (trimmedLine.match(/^G[0123]/i)) {
        let newX = currentX;
        let newY = currentY;
        let newZ = currentZ;
        
        // Extract coordinates
        const xMatch = trimmedLine.match(/X([-+]?[0-9]*\.?[0-9]+)/i);
        if (xMatch) newX = parseFloat(xMatch[1]);
        
        const yMatch = trimmedLine.match(/Y([-+]?[0-9]*\.?[0-9]+)/i);
        if (yMatch) newY = parseFloat(yMatch[1]);
        
        const zMatch = trimmedLine.match(/Z([-+]?[0-9]*\.?[0-9]+)/i);
        if (zMatch) newZ = parseFloat(zMatch[1]);
        
        // Determine if this is a cutting move
        const isG0 = trimmedLine.match(/^G0/i);
        const isMoving = newX !== currentX || newY !== currentY;
        
        // G1/G2/G3 are cutting moves, G0 is rapid positioning
        const thisMoveIsCutting = !isG0 && isMoving;
        
        // If we're starting a new cutting operation
        if (thisMoveIsCutting && !isCutting) {
          isCutting = true;
        }
        
        // If we're ending a cutting operation
        if (!thisMoveIsCutting && isCutting) {
          isCutting = false;
          
          // Save the current shape if it has length
          if (currentShape.length > 0) {
            result.shapes.push({
              ...currentShape,
              length: `${currentShape.length.toFixed(2)} ${units}`
            });
            
            // Start a new shape
            currentShape = {
              name: `Path ${++shapeIndex}`,
              length: 0,
              area: "Open path (no area)"
            };
          }
        }
        
        // Calculate distance moved for cutting operations
        if (thisMoveIsCutting) {
          const dx = newX - currentX;
          const dy = newY - currentY;
          const distance = Math.sqrt(dx*dx + dy*dy);
          
          totalLength += distance;
          currentShape.length += distance;
        }
        
        // Update current position
        currentX = newX;
        currentY = newY;
        currentZ = newZ;
        
        // Update bounding box
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);
      }
      
      // Tool change usually indicates a new operation
      if (trimmedLine.match(/^T[0-9]/i) || trimmedLine.match(/^M6/i)) {
        if (currentShape.length > 0) {
          result.shapes.push({
            ...currentShape,
            length: `${currentShape.length.toFixed(2)} ${units}`
          });
          
          // Start a new shape with the tool number if available
          const toolMatch = trimmedLine.match(/T([0-9]+)/i);
          const toolNum = toolMatch ? toolMatch[1] : shapeIndex + 1;
          
          currentShape = {
            name: `Tool ${toolNum} Path`,
            length: 0,
            area: "Open path (no area)"
          };
          
          shapeIndex++;
        }
      }
    }
    
    // Add the last shape if it has length
    if (currentShape.length > 0) {
      result.shapes.push({
        ...currentShape,
        length: `${currentShape.length.toFixed(2)} ${units}`
      });
    }
    
    // Set results
    result.pathLength = `${totalLength.toFixed(2)} ${units}`;
    
    // Calculate paper area if we have valid bounds
    if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
      const width = maxX - minX;
      const height = maxY - minY;
      result.paperArea = `${width.toFixed(2)}x${height.toFixed(2)} ${units}`;
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing G-code file:', error);
    return {
      fileName: path.basename(filePath),
      paperArea: "Unknown",
      letterArea: 0,
      pathLength: 0,
      shapes: [],
      error: `G-code analysis error: ${error.message}`
    };
  }
}

/**
 * Calculate polygon area using the shoelace formula
 */
function calculatePolygonArea(vertices) {
  let area = 0;
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  
  return Math.abs(area) / 2;
}

module.exports = {
  analyzeVectorFile
};