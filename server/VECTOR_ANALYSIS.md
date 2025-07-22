# Vector File Analysis

This module provides vector file analysis capabilities for the application. It can analyze various vector file formats to extract information such as:

- Paper/material dimensions
- Path lengths
- Shape areas
- File metadata

## Supported File Formats

- SVG (Scalable Vector Graphics)
- DXF (Drawing Exchange Format)
- PDF (Portable Document Format)
- AI (Adobe Illustrator)
- EPS (Encapsulated PostScript)
- G-code/NC files - for CNC machines

## Improving Vector Analysis

For better vector analysis results, additional tools are required. We've provided installation scripts:

- For Linux/macOS: `scripts/install-vector-tools.sh`
- For Windows: `scripts/install-vector-tools.bat`

These scripts will install:
- pdftk - PDF Toolkit for manipulating PDF files
- poppler-utils - PDF rendering library and command line tools
- Inkscape - Vector graphics editor with command-line capabilities
- pdf2svg - PDF to SVG converter
- pstoedit - PostScript and PDF converter
- librsvg - SVG rendering library

## Usage

The vector analysis is automatically performed when a file is uploaded through the contact form. The analysis results are stored in the database and can be viewed in the admin panel.

You can also manually analyze a file using the test utility:

```bash
# From the server directory
node test-vector-analysis.js path/to/your/file.svg
```

## Technical Details

The analysis uses different approaches depending on the file format:

- SVG: Uses Paper.js for accurate analysis when available, falls back to basic parsing
- DXF: Uses dxf-parser to extract entities and calculate dimensions
- PDF: Attempts to convert to SVG using pdf2svg or Inkscape, then analyzes the SVG
- AI/EPS: Attempts to convert to SVG using Inkscape or pstoedit, then analyzes the SVG
- G-code: Parses the file to calculate tool paths and dimensions

## Features

- Automatic file type detection based on content, not just extension
- Extraction of all vector paths, lines, curves, and shapes
- Calculation of path lengths for all shapes (perimeter)
- Detection of closed vs. open paths
- Calculation of enclosed areas for closed shapes
- Determination of overall canvas/paper dimensions
- Calculation of totals for files with multiple shapes

## Limitations

- Full vector analysis requires external tools (installed via the provided scripts)
- Complex vector files may not be analyzed with 100% accuracy
- Some proprietary formats may have limited support