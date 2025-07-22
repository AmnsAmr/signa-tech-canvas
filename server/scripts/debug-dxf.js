/**
 * Debug DXF parsing
 * 
 * Usage: node scripts/debug-dxf.js <path-to-dxf-file>
 */

const fs = require('fs');
const path = require('path');

// Try to load DXF parser
let DxfParser;
try {
  DxfParser = require('dxf-parser');
  console.log('DXF parser loaded successfully');
} catch (e) {
  console.error('Failed to load dxf-parser:', e.message);
  process.exit(1);
}

async function debugDxf() {
  // Get file path from command line arguments
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Please provide a path to a DXF file');
    console.log('Usage: node scripts/debug-dxf.js <path-to-dxf-file>');
    process.exit(1);
  }
  
  console.log(`Analyzing DXF file: ${filePath}`);
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`File size: ${fileContent.length} bytes`);
    
    // Parse the DXF file
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileContent);
    
    // Print header information
    console.log('\nHeader Information:');
    if (dxf.header) {
      console.log('  $ACADVER:', dxf.header.$ACADVER);
      if (dxf.header.$EXTMIN && dxf.header.$EXTMAX) {
        console.log('  $EXTMIN:', dxf.header.$EXTMIN);
        console.log('  $EXTMAX:', dxf.header.$EXTMAX);
      }
    } else {
      console.log('  No header information found');
    }
    
    // Print entities
    console.log('\nEntities:');
    if (dxf.entities && dxf.entities.length > 0) {
      console.log(`  Found ${dxf.entities.length} entities`);
      
      dxf.entities.forEach((entity, index) => {
        console.log(`\n  Entity ${index + 1}:`);
        console.log(`    Type: ${entity.type}`);
        
        // Print all properties safely
        console.log('    Properties:', JSON.stringify(entity, null, 2));
        
        switch (entity.type) {
          case 'LINE':
            if (entity.start && entity.end) {
              console.log(`    Start: (${entity.start.x}, ${entity.start.y})`);
              console.log(`    End: (${entity.end.x}, ${entity.end.y})`);
            } else {
              console.log('    Invalid LINE entity (missing start/end)');
            }
            break;
          case 'CIRCLE':
            if (entity.center) {
              console.log(`    Center: (${entity.center.x}, ${entity.center.y})`);
              console.log(`    Radius: ${entity.radius}`);
            } else {
              console.log('    Invalid CIRCLE entity (missing center)');
            }
            break;
          case 'ARC':
            if (entity.center) {
              console.log(`    Center: (${entity.center.x}, ${entity.center.y})`);
              console.log(`    Radius: ${entity.radius}`);
              console.log(`    Start Angle: ${entity.startAngle}`);
              console.log(`    End Angle: ${entity.endAngle}`);
            } else {
              console.log('    Invalid ARC entity (missing center)');
            }
            break;
          case 'POLYLINE':
          case 'LWPOLYLINE':
            console.log(`    Vertices: ${entity.vertices ? entity.vertices.length : 0}`);
            console.log(`    Closed: ${entity.closed ? 'Yes' : 'No'}`);
            break;
          default:
            // Already printed all properties above
            break;
        }
      });
    } else {
      console.log('  No entities found');
    }
    
  } catch (error) {
    console.error('Error parsing DXF file:', error);
    process.exit(1);
  }
}

debugDxf();