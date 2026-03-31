# API & Integration Documentation

## REST API Endpoints

### Authentication
```
POST /auth/login - User login
POST /auth/signup - Create account
POST /auth/logout - Logout
POST /auth/forgot-password - Reset password
```

### Students
```
GET /students - List all students
POST /students - Create student
GET /students/{id} - Get student details
PUT /students/{id} - Update student
DELETE /students/{id} - Delete student
GET /students/email/{email} - Find by email
```

### Certificates
```
GET /certificates - List certificates
POST /certificates - Create certificate
GET /certificates/{id} - Get certificate
GET /certificates/verify/{certId} - Verify certificate
PUT /certificates/{id} - Update certificate
DELETE /certificates/{id} - Delete certificate
GET /certificates/student/{studentId} - Get student's certificates
```

### Templates
```
GET /templates - List templates
POST /templates - Upload template
DELETE /templates/{id} - Delete template
GET /templates/{id}/download - Download template
```

## Firebase Firestore Queries

### Get students by course
```javascript
firebaseServices.db.collection('students')
  .where('course', '==', 'Web Development')
  .get()
```

### Get recent certificates
```javascript
firebaseServices.db.collection('certificates')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```

### Get verified certificates
```javascript
firebaseServices.db.collection('certificates')
  .where('verifyCount', '>', 0)
  .get()
```

## Webhooks

Configure webhooks for:
- Certificate generated
- Certificate verified
- Student added
- Email sent

## Rate Limiting

- 100 requests/minute per IP
- 1000 requests/hour per user
- File upload: 5MB max

## Response Format

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-03-31T10:30:00Z"
}
```

## Error Codes

- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error
- 503: Service unavailable
