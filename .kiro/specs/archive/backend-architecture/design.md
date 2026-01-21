# Backend Design Document

## Overview

The UniqueBrains backend uses a simplified serverless architecture built entirely on Supabase (PostgreSQL + Auth + Storage + Realtime) with GitHub Pages for static hosting. This design prioritizes cost-efficiency ($0/month for MVP), simplicity, and rapid deployment while maintaining security and performance.

## Architecture

### Technology Stack
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (JWT-based) with OAuth (Google)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime (WebSocket)
- **API**: Supabase PostgREST (Auto-generated REST API)
- **Hosting**: GitHub Pages (Static hosting)
- **Video Conferencing**: Manual links (Zoom/Teams/Meet) - Instructors provide their own meeting links
- **Email**: Supabase Auth emails (built-in)

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

### 5. Video Conferencing (Manual Links)

**Implementation:**
- Instructors manually add meeting links to sessions
- Support for Zoom, Google Meet, Microsoft Teams, or any video platform
- Meeting link stored in `sessions` table as a text field
- Students click link to join from the platform

**Session Data Model:**
```
sessions {
  id: uuid
  course_id: uuid
  title: text
  scheduled_at: timestamp
  duration_minutes: integer
  meeting_link: text  // Instructor provides their own link
  meeting_password: text (optional)
}
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

### Property 6: API Rate Limiting
*For any* user making API requests, the system must enforce rate limits and return 429 when exceeded.
**Validates: Requirements 14.1, 14.3**

### Property 7: Backup Integrity
*For any* automated backup, the system must verify data integrity before marking it as successful.
**Validates: Requirements 11.3**

### Property 8: Meeting Link Validation
*For any* session with a meeting link, the link must be a valid URL format.
**Validates: Requirements 12.1**

**Note:** Properties related to payment webhooks, email delivery retry, and webhook signature validation are deferred to post-launch when payment integration is added.

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
- GitHub Pages CDN (automatic)
- Supabase connection pooler (automatic)
- Supabase Storage CDN (automatic)

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
- SQL injection: Parameterized queries (Supabase handles automatically)
- XSS: Input sanitization
- CSRF: SameSite cookies
- DDoS: Rate limiting + Supabase protection + CAPTCHA
- Brute force: Account lockout after 5 failed attempts
- API abuse: CAPTCHA on sign-up, rate limiting per IP

## Deployment Strategy

### Environments
1. **Development**: Local development + Supabase project
2. **Production**: GitHub Pages + Supabase production project

### CI/CD Pipeline
```
1. Push to GitHub
2. Run tests (Vitest) - optional
3. Build frontend (Vite) - npm run build
4. Commit built files to docs/
5. Push to GitHub
6. GitHub Pages auto-deploys
```

### Database Migrations
- Use Supabase migrations
- Version controlled in Git
- Applied manually via Supabase Dashboard or CLI
- Rollback capability

### Monitoring
- GitHub Pages: Hosting status
- Supabase Dashboard: Database metrics, API usage, auth events
- Browser DevTools: Frontend performance
- Supabase Logs: Error tracking

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

### Free Tier Strategy (MVP Launch)
- **GitHub Pages**: Free unlimited bandwidth
- **Supabase Free Tier**: 
  - 500MB database storage
  - 50,000 monthly active users
  - 1GB file storage
  - 2GB bandwidth
  - Unlimited API requests (with rate limiting)

**Total Cost: $0/month** 🎉

### Scaling Path (When Needed)

**Phase 1: 1k-10k users**
- Supabase Pro: $25/month
  - 8GB database
  - 100k MAU
  - 100GB file storage
  - 250GB bandwidth

**Phase 2: 10k-50k users**
- Supabase Pro: $25/month (same tier)
- Consider adding:
  - Payment integration (Stripe): Transaction fees only
  - Email service (optional): $20/month

**Phase 3: 50k+ users**
- Supabase Team: $599/month (custom)
- Payment processing: Stripe fees
- Advanced features as needed

**Estimated Monthly Cost:**
- 0-10k users: $0
- 10k-50k users: $25
- 50k-100k users: $25-50
- 100k+ users: $599+

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

## Future Enhancements (Post-Launch)

### Phase 1: Monetization
1. **Stripe Integration**: Payment processing for paid courses
2. **Automated Zoom API**: Auto-generate meeting links
3. **Email Marketing**: Newsletter and course updates

### Phase 2: Advanced Features
4. **GraphQL API**: For more flexible queries
5. **Redis Cache**: For high-traffic endpoints
6. **Advanced Search**: Full-text search with filters
7. **AI Features**: Course recommendations, matching algorithm

### Phase 3: Scale & Mobile
8. **Mobile Apps**: Native iOS/Android
9. **Analytics Dashboard**: Instructor insights and metrics
10. **Multi-region CDN**: Global performance optimization
11. **Message Queue**: For async processing
