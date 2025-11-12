
## Endpoints

### Workouts

#### GET /workouts
List workouts with pagination and filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `workoutTypeId` (number, optional): Filter by workout type
- `startDate` (string, optional): Filter by start date (ISO 8601)
- `endDate` (string, optional): Filter by end date (ISO 8601)
- `sortBy` (string, optional): Sort field (`performedAt`, `durationMin`, `calories`, `createdAt`)
- `sortOrder` (string, optional): Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "workouts": [
    {
      "id": 1,
      "userId": 1,
      "workoutTypeId": 1,
      "durationMin": 45,
      "calories": 300,
      "performedAt": "2024-01-20T10:00:00.000Z",
      "notes": "Great workout",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "workoutType": {
        "id": 1,
        "name": "Cardio",
        "description": "Cardiovascular exercises",
        "color": "#10b981"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}