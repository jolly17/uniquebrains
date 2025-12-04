# Backend Design Document

## Overview

The UniqueBrains backend uses a serverless architecture built on Supabase (PostgreSQL + Auth + Storage + Realtime) with Vercel for hosting and edge functions. This design prioritizes cost-efficiency, scalability, and developer experience while maintaining security and performance.

## Architecture

### Technology Stack
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage + Cloudinary CDN
- **Realtime**: Supabase Realtime (WebSocket)
- **API**: Supabase PostgREST + Vercel Edge Functions
- **Hosting**: Vercel (Static + Serverless)
- **Payments**: Stripe
- **Email**: Resend/SendGrid
- **Video**: Zoom API

### Architecture Patterns
1. **Serverless-First**: No server management, auto-scaling
2. **API-First**: RESTful APIs with clear contracts
3. **Security by Default**: RLS policies, JWT auth, HTTPS
4. **Event-Driven**: Webhooks and database triggers
5. **Microservices**: Separate concerns (auth, storage, payments)

## Components and Interfaces

### 1. Authentication Service (Supabase Auth)

**Endpoints:**
```
POST /auth/v1/signup
POST /auth/v1/token (login)
POST /auth/v1/recover (password reset)
POST /auth/v1/user (update profile)
GET  /auth/v1/user (get current user)
```

**JWT Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "student|instructor|parent|admin",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 2. Database Service (Supabase PostgreSQL)

**Core Tables:**
- profiles: User information and roles
- courses: Course catalog and metadata
- enrollments: Student-course relationships
- sessions: Scheduled class sessions
- homework: Assignments and due dates
- submissions: Student homework submissions
- resources: Course materials and files
- messages: Chat and communication
- reviews: Course ratings and feedback
- payments: Transaction records

**RLS Policies:**
- Students can read own data and enrolled courses
- Instructors can manage own courses and view enrolled students
- Parents can manage children's profiles
- Public can read published courses

### 3. Storage Service

**File Organization:**
```
/profiles/{userId}/avatar.jpg
/courses/{courseId}/thumbnail.jpg
/courses/{courseId}/resources/{resourceId}/file.pdf
/homework/{homeworkId}/submissions/{studentId}/file.pdf
```

**Access Control:**
- Authenticated users can upload to own folders
- Public read for course thumbnails
- Private read for submissions (student + instructor only)

### 4. Realtime Service

**Channels:**
```
course:{courseId}:messages - Chat messages
course:{courseId}:updates - Content updates
user:{userId}:notifications - User notifications
```

**Event Types:**
- INSERT: New message/resource/homework
- UPDATE: Content modified
- DELETE: Content removed

### 5. Edge Functions (Vercel)

**Functions:**
```
/api/stripe/webhook - Handle payment events
/api/zoom/create-meeting - Create Zoom meetings
/api/email/send - Send transactional emails
/api/notifications/push - Send push notifications
```

## Data Models

See architecture-diagram.md for complete ER diagram.

**Key Relationships:**
- One instructor → Many courses
- One course → Many enrollments
- One course → Many sessions/homework/resources
- One homework → Many submissions
- One course → Many messages

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Authentication Token Validity
*For any* authenticated request, the JWT token must be valid, not expired, and contain a valid user ID that exists in the database.
**Validates: Requirements 1.2, 1.5**

### Property 2: Row Level Security Enforcement
*For any* database query, users can only access data they are authorized to view based on RLS policies.
**Validates: Requirements 2.3, 8.1**

### Property 3: Data Integrity
*For any* database transaction, foreign key constraints must be maintained and referential integrity preserved.
**Validates: Requirements 2.6**

### Property 4: File Upload Validation
*For any* file upload, the file size must not exceed 100MB and file type must be in the allowed list.
**Validates: Requirements 4.1, 4.2**

### Property 5: Real-time Message Delivery
*For any* message sent through WebSocket, all subscribed users must receive it within 1 second.
**Validates: Requirements 5.2**

### Property 6: Payment Idempotency
*For any* payment webhook, processing the same event multiple times must not create duplicate enrollments.
**Validates: Requirements 6.3**

### Property 7: Email Delivery Retry
*For any* failed email send, the system must retry up to 3 times with exponential backoff.
**Validates: Requirements 7.5**

### Property 8: API Rate Limiting
*For any* user making API requests, the system must enforce rate limits and return 429 when exceeded.
**Validates: Requirements 14.1, 14.3**

### Property 9: Backup Integrity
*For any* automated backup, the system must verify data integrity before marking it as successful.
**Validates: Requirements 11.3**

### Property 10: Webhook Signature Validation
*For any* incoming webhook, the system must validate the signature before processing the payload.
**Validates: Requirements 12.6**

## Error Handling

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email address is required",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}
```

**Error Categories:**
- 400: Client errors (validation, bad request)
- 401: Authentication errors
- 403: Authorization errors
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Server errors
- 503: Service unavailable

## Testing Strategy

### Unit Tests
- Database query functions
- Input validation logic
- Business logic functions
- Utility functions

### Integration Tests
- API endpoint flows
- Database transactions
- Third-party integrations
- Webhook handlers

### Property-Based Tests
- Authentication token validation
- RLS policy enforcement
- Rate limiting behavior
- Data integrity constraints

**Testing Framework:** Vitest + Supabase Test Helpers

## Performance Considerations

### Database Optimization
- Indexes on foreign keys and frequently queried columns
- Connection pooling (Supabase handles automatically)
- Query optimization using EXPLAIN ANALYZE
- Materialized views for complex aggregations

### Caching Strategy
- Browser cache: Static assets (1 year)
- CDN cache: Images and files (1 month)
- API cache: Public course list (5 minutes)
- Database cache: Supabase built-in query cache

### Load Balancing
- Vercel Edge Network (automatic)
- Supabase connection pooler (automatic)
- Cloudinary CDN (automatic)

## Security Measures

### Authentication
- JWT tokens with 24-hour expiration
- Refresh tokens for extended sessions
- Password hashing with bcrypt (10 rounds)
- Email verification required
- OAuth support (Google, GitHub)

### Authorization
- Row Level Security at database level
- Role-based access control
- API endpoint protection
- Resource ownership validation

### Data Protection
- HTTPS/TLS 1.3 for all communications
- Encryption at rest (Supabase default)
- Sensitive data masking in logs
- GDPR compliance tools

### Attack Prevention
- SQL injection: Parameterized queries
- XSS: Input sanitization
- CSRF: SameSite cookies
- DDoS: Rate limiting + Vercel protection
- Brute force: Account lockout after 5 failed attempts

## Deployment Strategy

### Environments
1. **Development**: Local Supabase + Vite dev server
2. **Staging**: Vercel preview + Supabase staging project
3. **Production**: Vercel production + Supabase production project

### CI/CD Pipeline
```
1. Push to GitHub
2. Run tests (Vitest)
3. Build frontend (Vite)
4. Deploy to Vercel
5. Run smoke tests
6. Notify team
```

### Database Migrations
- Use Supabase migrations
- Version controlled in Git
- Applied automatically on deploy
- Rollback capability

### Monitoring
- Vercel Analytics: Performance metrics
- Supabase Dashboard: Database metrics
- Sentry: Error tracking
- Custom dashboards: Business metrics

## Scalability Plan

### Current Capacity (Free Tier)
- 50,000 monthly active users
- 500MB database storage
- 2GB bandwidth
- 1GB file storage

### Scaling Triggers
- Database: > 400MB used → Upgrade to Pro
- Bandwidth: > 1.5GB/month → Add CDN
- Users: > 40k MAU → Upgrade Supabase
- API calls: > 1M/month → Optimize queries

### Horizontal Scaling
- Serverless functions scale automatically
- Database read replicas for heavy read loads
- CDN for global distribution
- Caching layer (Redis) if needed

## Cost Optimization

### Free Tier Strategy
- Supabase: Free up to 500MB + 50k MAU
- Vercel: Free for hobby projects
- Cloudinary: Free 25GB storage
- Resend: Free 100 emails/day

### Paid Tier Costs
- Supabase Pro: $25/month (2GB + 100k MAU)
- Vercel Pro: $20/month (unlimited bandwidth)
- Cloudinary Plus: $89/month (100GB)
- Resend Pro: $20/month (50k emails)

**Estimated Monthly Cost:**
- 0-1k users: $0
- 1k-10k users: $50
- 10k-50k users: $150
- 50k+ users: $300+

## API Documentation

Full API documentation available at: `/api/docs` (Swagger UI)

**Example Endpoint:**
```
GET /rest/v1/courses?is_published=eq.true&select=*,profiles(first_name,last_name)

Response:
[
  {
    "id": "uuid",
    "title": "Piano for Beginners",
    "price": 79.99,
    "instructor_id": "uuid",
    "profiles": {
      "first_name": "Michael",
      "last_name": "Chen"
    }
  }
]
```

## Future Enhancements

1. **GraphQL API**: For more flexible queries
2. **Redis Cache**: For high-traffic endpoints
3. **Elasticsearch**: For advanced search
4. **Message Queue**: For async processing
5. **CDN Optimization**: Multi-region distribution
6. **AI Features**: Course recommendations
7. **Mobile Apps**: Native iOS/Android
8. **Analytics Dashboard**: Instructor insights
