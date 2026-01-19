# CO2 Impact Calculation Feature

This document describes the CO2 impact calculation feature that tracks environmental contributions from completed maintenance missions.

## Overview

The CO2 calculation feature allows teachers and students to view the environmental impact of their green schoolyard maintenance work. It calculates CO2 reduction based on completed missions and their associated sector types.

**Implements:** Requirement 14 (CO2 Impact Calculation)

## Architecture

The feature is implemented in the `calculation-service` (port 3006) and exposed through the API Gateway.

```
Frontend → API Gateway (/api/calculate/*) → Calculation Service → PostgreSQL
```

## CO2 Factors

Each task type has an associated CO2 reduction factor (kg CO2 per completed mission):

| Task Type | CO2 Factor | Description |
|-----------|------------|-------------|
| WATERING  | 0.5 kg     | Watering plants, trees, flowers |
| WEEDING   | 0.3 kg     | Removing weeds |
| PLANTING  | 1.0 kg     | Planting new vegetation |
| CLEANING  | 0.2 kg     | General maintenance and cleaning |
| FEEDING   | 0.1 kg     | Feeding animals |

Factors are configurable via environment variables (`CO2_FACTOR_*`).

## Sector Type Mapping

Since missions are associated with sectors rather than explicit task types, we map sector types to task types:

| Sector Type | Task Type | Rationale |
|-------------|-----------|-----------|
| TREES       | WATERING  | Trees need regular watering |
| FLOWERS     | WATERING  | Flowers need regular watering |
| POND        | WATERING  | Pond maintenance involves water |
| GARDEN      | PLANTING  | Gardens involve planting activities |
| COMPOST     | CLEANING  | Compost requires maintenance |
| PLAYGROUND  | CLEANING  | Playground needs cleaning |
| OTHER       | CLEANING  | Default to cleaning |
| ANIMALS     | FEEDING   | Animal care involves feeding |
| CHICKENS    | FEEDING   | Chicken care involves feeding |

## API Endpoints

### POST /api/calculate/co2

Calculate CO2 reduction for a set of missions.

**Request:**
```json
{
  "missions": [
    { "sectorType": "TREES", "quantity": 2 },
    { "sectorType": "GARDEN", "quantity": 1 },
    { "sectorType": "ANIMALS", "quantity": 3 }
  ]
}
```

**Response:**
```json
{
  "totalCO2Reduction": 1.3,
  "unit": "kg",
  "breakdown": [
    {
      "sectorType": "TREES",
      "taskType": "WATERING",
      "quantity": 2,
      "co2Factor": 0.5,
      "co2Reduction": 1.0
    },
    {
      "sectorType": "GARDEN",
      "taskType": "PLANTING",
      "quantity": 1,
      "co2Factor": 1.0,
      "co2Reduction": 1.0
    },
    {
      "sectorType": "ANIMALS",
      "taskType": "FEEDING",
      "quantity": 3,
      "co2Factor": 0.1,
      "co2Reduction": 0.3
    }
  ]
}
```

### GET /api/calculate/co2/class/:classId

Get aggregated CO2 reduction for a class based on completed submissions.

**Query Parameters:**
- `startDate` (optional): ISO date string for filtering
- `endDate` (optional): ISO date string for filtering

**Example:** `GET /api/calculate/co2/class/abc123?startDate=2026-01-01T00:00:00Z`

**Response:**
```json
{
  "classId": "abc123",
  "totalCO2Reduction": 15.5,
  "unit": "kg",
  "missionCount": 42,
  "breakdown": [
    {
      "taskType": "WATERING",
      "missionCount": 20,
      "co2Factor": 0.5,
      "co2Reduction": 10.0
    },
    {
      "taskType": "PLANTING",
      "missionCount": 5,
      "co2Factor": 1.0,
      "co2Reduction": 5.0
    },
    {
      "taskType": "FEEDING",
      "missionCount": 5,
      "co2Factor": 0.1,
      "co2Reduction": 0.5
    }
  ],
  "dateRange": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": null
  }
}
```

**Empty Response (no completed missions):**
```json
{
  "classId": "abc123",
  "totalCO2Reduction": 0,
  "unit": "kg",
  "missionCount": 0,
  "breakdown": [],
  "message": "No completed missions found for this class"
}
```

### GET /api/calculate/co2/factors

Get current CO2 factors configuration.

**Response:**
```json
{
  "factors": {
    "WATERING": 0.5,
    "WEEDING": 0.3,
    "PLANTING": 1.0,
    "CLEANING": 0.2,
    "FEEDING": 0.1
  },
  "sectorMapping": {
    "TREES": "WATERING",
    "FLOWERS": "WATERING",
    "POND": "WATERING",
    "GARDEN": "PLANTING",
    "COMPOST": "CLEANING",
    "PLAYGROUND": "CLEANING",
    "OTHER": "CLEANING",
    "ANIMALS": "FEEDING",
    "CHICKENS": "FEEDING"
  },
  "unit": "kg CO2 per mission"
}
```

## Configuration

Environment variables in `calculation-service/.env`:

```bash
# CO2 Calculation Factors (kg CO2 per unit)
CO2_FACTOR_WATERING=0.5
CO2_FACTOR_WEEDING=0.3
CO2_FACTOR_PLANTING=1.0
CO2_FACTOR_CLEANING=0.2
CO2_FACTOR_FEEDING=0.1
```

## Future Enhancements

- [ ] Frontend CO2 dashboard component (Task 14.5)
- [ ] Historical CO2 tracking graphs
- [ ] Class leaderboard based on CO2 impact
- [ ] Achievements/badges for CO2 milestones
- [ ] Export CO2 reports (PDF/CSV)
