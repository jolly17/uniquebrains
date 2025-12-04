# UniqueBrains Backend Architecture & Data Flow

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>React SPA]
        MOBILE[Mobile Browser<br/>Responsive UI]
    end

    subgraph "CDN & Hosting"
        VERCEL[Vercel<br/>Static Hosting + Edge Functions]
        CF[Cloudflare CDN<br/>Optional]
    end

    subgraph "Backend Services - Supabase"
        AUTH[Supabase Auth<br/>JWT + OAuth]
        DB[(PostgreSQL<br/>Database)]
        STORAGE[Supabase Storage<br/>File Management]
        REALTIME[Realtime<br/>WebSocket Server]
        EDGE[Edge Functions<br/>Serverless API]
    end

    subgraph "External Services"
        CLOUDINARY[Cloudinary<br/>Image/Video CDN]
        STRIPE[Stripe<br/>Payment Processing]
        EMAIL[Resend/SendGrid<br/>Email Service]
        ZOOM[Zoom API<br/>Video Conferencing]
    end

    subgraph "Data Storage"
        PROFILES[(Profiles Table)]
        COURSES[(Courses Table)]
        ENROLLMENTS[(Enrollments Table)]
        SESSIONS[(Sessions Table)]
        HOMEWORK[(Homework Table)]
        SUBMISSIONS[(Submissions Table)]
        RESOURCES[(Resources Table)]
        MESSAGES[(Messages Table)]
        REVIEWS[(Reviews Table)]
        PAYMENTS[(Payments Table)]
    end

    WEB --> VERCEL
    MOBILE --> VERCEL
    VERCEL --> CF
    CF --> AUTH
    CF --> DB
    CF --> STORAGE
    CF --> REALTIME
    CF --> EDGE

    AUTH --> PROFILES
    DB --> PROFILES
    DB --> COURSES
    DB --> ENROLLMENTS
    DB --> SESSIONS
    DB --> HOMEWORK
    DB --> SUBMISSIONS
    DB --> RESOURCES
    DB --> MESSAGES
    DB --> REVIEWS
    DB --> PAYMENTS

    EDGE --> STRIPE
    EDGE --> EMAIL
    EDGE --> ZOOM
    STORAGE --> CLOUDINARY

    style WEB fill:#667eea
    style MOBILE fill:#667eea
    style AUTH fill:#3ecf8e
    style DB fill:#3ecf8e
    style STORAGE fill:#3ecf8e
    style REALTIME fill:#3ecf8e
    style EDGE fill:#3ecf8e
```

## Data Flow Diagrams

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Supabase Auth
    participant D as Database
    participant E as Email Service

    U->>F: Enter credentials
    F->>A: signUp/signIn request
    A->>A: Validate credentials
    A->>D: Create/verify user
    D-->>A: User data
    A->>A: Generate JWT token
    A-->>F: Return session + JWT
    F->>F: Store session
    F->>D: Fetch user profile
    D-->>F: Profile data
    F-->>U: Redirect to dashboard
    
    opt Email Verification
        A->>E: Send verification email
        E-->>U: Verification link
        U->>A: Click verification link
        A->>D: Update verified status
    end
```

### 2. Course Creation & Publishing Flow

```mermaid
sequenceDiagram
    participant I as Instructor
    participant F as Frontend
    participant D as Database
    participant C as Cloudinary
    participant N as Notification Service

    I->>F: Create course form
    I->>F: Upload thumbnail
    F->>C: Upload image
    C-->>F: Image URL
    F->>D: Create course record
    D-->>F: Course created
    F-->>I: Show success

    I->>F: Publish course
    F->>D: Update is_published=true
    D->>D: Trigger course_published event
    D->>N: Notify interested students
    N-->>Students: Email notifications
    F-->>I: Course published
```

### 3. Student Enrollment Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant D as Database
    participant P as Stripe
    participant E as Email Service

    S->>F: Browse courses
    F->>D: Fetch published courses
    D-->>F: Course list
    F-->>S: Display courses

    S->>F: Enroll in course
    
    alt Paid Course
        F->>P: Create checkout session
        P-->>F: Checkout URL
        F-->>S: Redirect to Stripe
        S->>P: Complete payment
        P->>F: Payment webhook
        F->>D: Create enrollment
    else Free Course
        F->>D: Create enrollment
    end

    D->>D: Increment enrollment count
    D-->>F: Enrollment confirmed
    F->>E: Send welcome email
    E-->>S: Welcome email
    F-->>S: Redirect to course
```

### 4. Homework Submission & Feedback Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant D as Database
    participant ST as Storage
    participant I as Instructor
    participant N as Notification

    I->>F: Create homework assignment
    F->>D: Insert homework record
    D->>N: Notify enrolled students
    N-->>S: New homework notification

    S->>F: View homework
    F->>D: Fetch homework details
    D-->>F: Homework data
    
    S->>F: Submit homework
    
    alt File Upload
        F->>ST: Upload file
        ST-->>F: File URL
    end
    
    F->>D: Create submission record
    D->>N: Notify instructor
    N-->>I: New submission notification

    I->>F: View submissions
    F->>D: Fetch submissions
    D-->>F: Submission list
    
    I->>F: Provide feedback
    F->>D: Update submission with feedback
    D->>N: Notify student
    N-->>S: Feedback notification
    F-->>I: Feedback saved
```

### 5. Real-time Chat Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant F1 as Frontend 1
    participant R as Realtime Server
    participant D as Database
    participant F2 as Frontend 2
    participant U2 as User 2

    U1->>F1: Type message
    F1->>D: Insert message
    D-->>F1: Message saved
    D->>R: Broadcast message event
    R-->>F1: Message confirmation
    R-->>F2: New message event
    F2->>D: Fetch message details
    D-->>F2: Message data
    F2-->>U2: Display message
    
    F2->>D: Mark as read
    D->>R: Broadcast read event
    R-->>F1: Read receipt
    F1-->>U1: Show read indicator
```

### 6. Session Scheduling Flow

```mermaid
sequenceDiagram
    participant I as Instructor
    participant F as Frontend
    participant D as Database
    participant Z as Zoom API
    participant S as Student
    participant E as Email Service

    I->>F: Create session
    F->>Z: Create Zoom meeting
    Z-->>F: Meeting link
    F->>D: Insert session record
    D-->>F: Session created
    
    D->>E: Send calendar invites
    E-->>S: Email with meeting link
    E-->>I: Confirmation email

    alt Before Session
        D->>E: Send reminder (24h before)
        E-->>S: Reminder email
        E-->>I: Reminder email
    end

    alt During Session
        S->>F: Click "Join Session"
        F-->>S: Redirect to Zoom
    end

    alt After Session
        I->>F: Mark session complete
        F->>D: Update session status
        D-->>F: Updated
    end
```

### 7. Resource Sharing Flow

```mermaid
sequenceDiagram
    participant I as Instructor
    participant F as Frontend
    participant ST as Storage
    participant D as Database
    participant S as Student
    participant N as Notification

    I->>F: Upload resource
    
    alt File Upload
        F->>ST: Upload file
        ST-->>F: File URL + metadata
    else Web Link
        F->>F: Validate URL
    end

    F->>D: Insert resource record
    D->>N: Notify enrolled students
    N-->>S: New resource notification
    D-->>F: Resource created
    F-->>I: Success message

    S->>F: View resources
    F->>D: Fetch course resources
    D-->>F: Resource list
    F-->>S: Display resources

    S->>F: Download/access resource
    F->>D: Track view
    D->>D: Add student to viewedBy
    
    alt File Download
        F->>ST: Request file
        ST-->>S: Download file
    else Web Link
        F-->>S: Open in new tab
    end
```

## Database Schema Relationships

```mermaid
erDiagram
    PROFILES ||--o{ COURSES : creates
    PROFILES ||--o{ ENROLLMENTS : enrolls
    PROFILES ||--o{ REVIEWS : writes
    PROFILES ||--o{ MESSAGES : sends
    PROFILES ||--o{ SUBMISSIONS : submits
    
    COURSES ||--o{ ENROLLMENTS : has
    COURSES ||--o{ SESSIONS : contains
    COURSES ||--o{ HOMEWORK : includes
    COURSES ||--o{ RESOURCES : provides
    COURSES ||--o{ MESSAGES : facilitates
    COURSES ||--o{ REVIEWS : receives
    
    HOMEWORK ||--o{ SUBMISSIONS : receives
    
    ENROLLMENTS ||--o{ SESSIONS : schedules
    
    PROFILES {
        uuid id PK
        text email UK
        text first_name
        text last_name
        text role
        text[] neurodiversity_profile
        text other_needs
        text profile_picture
        timestamp created_at
    }
    
    COURSES {
        uuid id PK
        text title
        text description
        text category
        decimal price
        uuid instructor_id FK
        boolean is_published
        decimal average_rating
        int total_ratings
        text thumbnail
        int session_duration
        text course_type
        timestamp created_at
    }
    
    ENROLLMENTS {
        uuid id PK
        uuid student_id FK
        uuid course_id FK
        timestamp enrolled_at
        int progress
    }
    
    SESSIONS {
        uuid id PK
        uuid course_id FK
        uuid student_id FK
        date date
        text time
        text topic
        text meeting_link
        text status
    }
    
    HOMEWORK {
        uuid id PK
        uuid course_id FK
        text title
        text description
        text submission_type
        date due_date
        timestamp created_at
    }
    
    SUBMISSIONS {
        uuid id PK
        uuid homework_id FK
        uuid student_id FK
        text content
        text feedback
        timestamp submitted_at
        timestamp feedback_at
    }
    
    RESOURCES {
        uuid id PK
        uuid course_id FK
        text title
        text type
        text url
        text file_name
        uuid[] viewed_by
        timestamp added_at
    }
    
    MESSAGES {
        uuid id PK
        uuid course_id FK
        uuid sender_id FK
        uuid recipient_id
        text message
        uuid[] read_by
        timestamp sent_at
    }
    
    REVIEWS {
        uuid id PK
        uuid course_id FK
        uuid student_id FK
        int rating
        text review_text
        timestamp created_at
    }
```

## API Endpoints Architecture

### REST API Endpoints (via Supabase)

```
Authentication:
POST   /auth/signup              - Register new user
POST   /auth/signin              - Login user
POST   /auth/signout             - Logout user
POST   /auth/reset-password      - Request password reset
PUT    /auth/update-password     - Update password

Profiles:
GET    /profiles/:id             - Get user profile
PUT    /profiles/:id             - Update profile
GET    /profiles/instructor/:id  - Get instructor details

Courses:
GET    /courses                  - List all published courses
GET    /courses/:id              - Get course details
POST   /courses                  - Create course (instructor)
PUT    /courses/:id              - Update course (instructor)
DELETE /courses/:id              - Delete course (instructor)
GET    /courses/instructor/:id   - Get instructor's courses

Enrollments:
GET    /enrollments/student/:id  - Get student enrollments
POST   /enrollments              - Enroll in course
DELETE /enrollments/:id          - Unenroll from course

Sessions:
GET    /sessions/course/:id      - Get course sessions
POST   /sessions                 - Create session (instructor)
PUT    /sessions/:id             - Update session
DELETE /sessions/:id             - Delete session

Homework:
GET    /homework/course/:id      - Get course homework
POST   /homework                 - Create homework (instructor)
PUT    /homework/:id             - Update homework
DELETE /homework/:id             - Delete homework

Submissions:
GET    /submissions/homework/:id - Get homework submissions
POST   /submissions              - Submit homework (student)
PUT    /submissions/:id          - Update submission feedback

Resources:
GET    /resources/course/:id     - Get course resources
POST   /resources                - Add resource (instructor)
DELETE /resources/:id            - Delete resource

Messages:
GET    /messages/course/:id      - Get course messages
POST   /messages                 - Send message
PUT    /messages/:id/read        - Mark as read

Reviews:
GET    /reviews/course/:id       - Get course reviews
POST   /reviews                  - Create review
PUT    /reviews/:id              - Update review
```

### Realtime Subscriptions (via Supabase Realtime)

```
Channels:
course:{courseId}:messages       - Real-time chat messages
course:{courseId}:updates        - Course content updates
user:{userId}:notifications      - User notifications
session:{sessionId}:status       - Session status updates
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        RLS[Row Level Security<br/>Database Level]
        JWT[JWT Authentication<br/>Token Based]
        HTTPS[HTTPS/TLS<br/>Transport Security]
        CORS[CORS Policy<br/>Origin Control]
        RATE[Rate Limiting<br/>API Protection]
    end

    subgraph "Access Control"
        STUDENT[Student Role]
        INSTRUCTOR[Instructor Role]
        PARENT[Parent Role]
        ADMIN[Admin Role]
    end

    subgraph "Protected Resources"
        OWN[Own Data]
        ENROLLED[Enrolled Courses]
        CREATED[Created Content]
        PUBLIC[Public Content]
    end

    JWT --> RLS
    HTTPS --> JWT
    CORS --> HTTPS
    RATE --> CORS

    STUDENT --> OWN
    STUDENT --> ENROLLED
    INSTRUCTOR --> CREATED
    INSTRUCTOR --> OWN
    PARENT --> OWN
    ADMIN --> PUBLIC

    RLS --> OWN
    RLS --> ENROLLED
    RLS --> CREATED
    RLS --> PUBLIC
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        DEV[Local Dev<br/>npm run dev]
        TEST[Testing<br/>Vitest]
    end

    subgraph "CI/CD"
        GIT[GitHub<br/>Version Control]
        ACTIONS[GitHub Actions<br/>CI Pipeline]
    end

    subgraph "Staging"
        PREVIEW[Vercel Preview<br/>PR Deployments]
    end

    subgraph "Production"
        PROD[Vercel Production<br/>Main Branch]
        DOMAIN[Custom Domain<br/>uniquebrains.com]
    end

    DEV --> GIT
    TEST --> GIT
    GIT --> ACTIONS
    ACTIONS --> PREVIEW
    ACTIONS --> PROD
    PROD --> DOMAIN
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Frontend Optimization"
        LAZY[Lazy Loading<br/>Code Splitting]
        CACHE[Browser Cache<br/>Service Worker]
        COMPRESS[Asset Compression<br/>Gzip/Brotli]
    end

    subgraph "Backend Optimization"
        INDEX[Database Indexes<br/>Query Optimization]
        POOL[Connection Pooling<br/>Supabase]
        EDGE_FN[Edge Functions<br/>Low Latency]
    end

    subgraph "CDN Layer"
        STATIC[Static Assets<br/>Vercel Edge]
        IMAGES[Image Optimization<br/>Cloudinary]
        GLOBAL[Global Distribution<br/>Edge Network]
    end

    LAZY --> CACHE
    CACHE --> COMPRESS
    INDEX --> POOL
    POOL --> EDGE_FN
    COMPRESS --> STATIC
    STATIC --> IMAGES
    IMAGES --> GLOBAL
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Monitoring"
        LOGS[Application Logs<br/>Vercel Logs]
        ERRORS[Error Tracking<br/>Sentry]
        PERF[Performance<br/>Web Vitals]
    end

    subgraph "Database Monitoring"
        QUERIES[Query Performance<br/>Supabase Dashboard]
        USAGE[Resource Usage<br/>Connection Stats]
    end

    subgraph "User Analytics"
        ANALYTICS[User Behavior<br/>Google Analytics]
        EVENTS[Custom Events<br/>Mixpanel/Amplitude]
    end

    subgraph "Alerts"
        EMAIL_ALERT[Email Alerts]
        SLACK[Slack Notifications]
    end

    LOGS --> EMAIL_ALERT
    ERRORS --> SLACK
    QUERIES --> EMAIL_ALERT
    USAGE --> SLACK
```

## Scalability Strategy

### Current Architecture (Free Tier)
- **Users**: Up to 50k MAU
- **Database**: 500MB storage
- **Bandwidth**: 2GB/month
- **Storage**: 1GB files

### Growth Path

```
Phase 1: 0-1000 users (Free Tier)
├── Supabase Free
├── Vercel Free
└── Cloudinary Free

Phase 2: 1000-10000 users ($50/month)
├── Supabase Pro ($25/month)
├── Vercel Pro ($20/month)
└── Cloudinary Plus ($5/month)

Phase 3: 10000+ users ($200+/month)
├── Supabase Team ($599/month)
├── Vercel Team ($20/user/month)
├── Cloudinary Advanced ($99/month)
└── Dedicated Redis Cache
```

## Technology Stack Summary

| Layer | Technology | Purpose | Cost |
|-------|-----------|---------|------|
| Frontend | React + Vite | UI Framework | Free |
| Hosting | Vercel | Static Hosting | Free |
| Database | Supabase PostgreSQL | Data Storage | Free |
| Auth | Supabase Auth | User Management | Free |
| Storage | Supabase Storage + Cloudinary | File Storage | Free |
| Realtime | Supabase Realtime | WebSocket | Free |
| Payments | Stripe | Payment Processing | Transaction fees |
| Email | Resend/SendGrid | Transactional Email | Free (100/day) |
| Video | Zoom API | Video Conferencing | Pay per use |
| CDN | Vercel Edge + Cloudflare | Content Delivery | Free |
| Monitoring | Sentry | Error Tracking | Free |
| Analytics | Google Analytics | User Analytics | Free |

**Total Monthly Cost: $0-12** (just domain registration)
