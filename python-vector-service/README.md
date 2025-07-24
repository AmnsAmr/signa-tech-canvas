# Python Vector Analysis Microservice

This microservice handles vector file processing and calculations for the Signa Tech Canvas application.

## Features

- **File Format Support**: SVG, DXF, EPS, PDF
- **Accurate Analysis**: Uses specialized Python libraries for precise calculations
- **REST API**: Simple HTTP interface for file upload and analysis
- **Detailed Results**: Returns canvas area, shape areas, path lengths, and individual shape data

## Dependencies

- Flask - Web framework
- PyMuPDF - PDF processing
- ezdxf - DXF file handling
- shapely - Geometric calculations
- svgpathtools - SVG path analysis

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Start the service:
```bash
python app.py
```

The service will run on `http://localhost:5001`

### API Endpoints

#### POST /analyze
Upload and analyze a vector file.

**Request**: Multipart form data with 'file' field
**Response**: JSON with analysis results

```json
{
  "fileName": "example.svg",
  "paperArea": "100.00x200.00 mm",
  "letterArea": "50.25 mm²",
  "pathLength": "150.75 mm",
  "shapes": [
    {
      "name": "Path 1",
      "length": "75.25 mm",
      "area": "25.50 mm²"
    }
  ],
  "units": "mm"
}
```

#### GET /health
Health check endpoint.

**Response**: `{"status": "healthy"}`

## Integration

This service is called by the Node.js backend via HTTP requests. The Node.js server forwards vector files to this service and returns the results to the frontend.