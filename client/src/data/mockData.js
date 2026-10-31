// Realistic operational dataset for MeetMind AI Demonstration

export const INITIAL_MEETINGS = [
  {
    id: "meet-101",
    title: "Sprint Planning & Core Architecture Review",
    date: "2026-11-01",
    time: "10:00 AM - 11:15 AM",
    duration: "75 mins",
    status: "Approved",
    participants: [
      { name: "Rahul Sharma", role: "Backend Lead", avatar: "RS", color: "#426B50" },
      { name: "Priya Patel", role: "Frontend Lead", avatar: "PP", color: "#8DAF91" },
      { name: "Alex Chen", role: "Database Engineer", avatar: "AC", color: "#2D6A8E" },
      { name: "Sarah Jenkins", role: "Product Manager", avatar: "SJ", color: "#8B7355" }
    ],
    summary: "The team finalized the technical roadmap for the upcoming sprint. Key focus areas include completing the OAuth 2.0 authentication service, delivering responsive dashboard UI components, and proceeding with the planned MongoDB database migration. Outstanding cross-team API contract alignment was flagged as a critical dependency.",
    discussionPoints: [
      {
        topic: "Authentication Architecture",
        notes: "Evaluated session vs JWT tokens. Decided to proceed with stateless JWT tokens with refresh rotation for API scalability.",
        speaker: "Rahul Sharma"
      },
      {
        topic: "Dashboard UI & Design System",
        notes: "Priya confirmed the soft sage green SaaS theme is ready for component migration. Frontend team needs verified API schemas by Nov 3.",
        speaker: "Priya Patel"
      },
      {
        topic: "MongoDB Cluster Setup",
        notes: "Alex presented the replica set configuration on MongoDB Atlas with automated daily snapshots.",
        speaker: "Alex Chen"
      },
      {
        topic: "Unresolved API Integration",
        notes: "Identified that the backend-frontend integration for user workspaces is carried over from the Oct 24 sync and needs prompt resolution.",
        speaker: "Sarah Jenkins"
      }
    ],
    actionItemsCount: 4,
    decisionsCount: 2,
    rawNotes: `Sprint Planning & Core Architecture Review
Date: Nov 1, 2026
Attendees: Rahul Sharma, Priya Patel, Alex Chen, Sarah Jenkins

Key Discussion:
- Rahul must complete the authentication API by November 5.
- Priya must complete the dashboard UI by November 3.
- Alex will finalize the MongoDB indexing strategy by November 6.
- The team officially decided to use MongoDB as the document store.
- Team agreed to standardize API response error codes across all microservices.
- Note: The API integration is still pending from the previous meeting and Rahul needs to coordinate with Priya.`
  },
  {
    id: "meet-102",
    title: "Database Selection & Infrastructure Sync",
    date: "2026-10-28",
    time: "02:30 PM - 03:30 PM",
    duration: "60 mins",
    status: "Approved",
    participants: [
      { name: "Alex Chen", role: "Database Engineer", avatar: "AC", color: "#2D6A8E" },
      { name: "Rahul Sharma", role: "Backend Lead", avatar: "RS", color: "#426B50" },
      { name: "Sarah Jenkins", role: "Product Manager", avatar: "SJ", color: "#8B7355" }
    ],
    summary: "Comprehensive architectural review comparing PostgreSQL vs MongoDB for meeting intelligence schemas and flexible transcription metadata.",
    discussionPoints: [
      {
        topic: "Document Schema Flexibility",
        notes: "Meeting transcripts and unstructured AI outputs benefit from document modeling rather than rigid relational joins.",
        speaker: "Alex Chen"
      },
      {
        topic: "Indexing & Vector Support",
        notes: "MongoDB Atlas search and vector index capabilities satisfy our upcoming agent retrieval specifications.",
        speaker: "Rahul Sharma"
      }
    ],
    actionItemsCount: 3,
    decisionsCount: 1,
    rawNotes: "Evaluated DB alternatives. Unanimous agreement to adopt MongoDB."
  },
  {
    id: "meet-103",
    title: "API Integration & Frontend Alignment",
    date: "2026-10-24",
    time: "11:00 AM - 12:00 PM",
    duration: "60 mins",
    status: "Approved",
    participants: [
      { name: "Rahul Sharma", role: "Backend Lead", avatar: "RS", color: "#426B50" },
      { name: "Priya Patel", role: "Frontend Lead", avatar: "PP", color: "#8DAF91" },
      { name: "David Kim", role: "QA Engineer", avatar: "DK", color: "#C98818" }
    ],
    summary: "Cross-functional review on REST endpoints for user authentication, workspace provisioning, and meeting agenda synchronization.",
    discussionPoints: [
      {
        topic: "Swagger API Documentation",
        notes: "Rahul to publish OpenAPI 3.0 specs for meetings and task controllers.",
        speaker: "Rahul Sharma"
      },
      {
        topic: "Integration Blocker",
        notes: "Frontend team blocked on user profile payload schema changes.",
        speaker: "Priya Patel"
      }
    ],
    actionItemsCount: 3,
    decisionsCount: 1,
    rawNotes: "Meeting to resolve API mismatches. API integration remains pending."
  },
  {
    id: "meet-104",
    title: "Quarterly Product Security & Compliance",
    date: "2026-10-18",
    time: "03:00 PM - 04:00 PM",
    duration: "60 mins",
    status: "Approved",
    participants: [
      { name: "David Kim", role: "QA Engineer", avatar: "DK", color: "#C98818" },
      { name: "Sarah Jenkins", role: "Product Manager", avatar: "SJ", color: "#8B7355" },
      { name: "Rahul Sharma", role: "Backend Lead", avatar: "RS", color: "#426B50" }
    ],
    summary: "Review of SOC2 compliance requirements, API token expiration rules, and data encryption at rest for meeting transcripts.",
    discussionPoints: [
      {
        topic: "Encryption Standards",
        notes: "All sensitive meeting notes must be encrypted using AES-256 in MongoDB.",
        speaker: "David Kim"
      }
    ],
    actionItemsCount: 2,
    decisionsCount: 1,
    rawNotes: "Security audit preparation."
  }
];

export const INITIAL_TASKS = [
  {
    id: "tsk-001",
    title: "Complete Authentication API with JWT Refresh",
    description: "Implement OAuth 2.0 and JWT token generation with 15-minute expiration and rotating refresh tokens.",
    owner: "Rahul Sharma",
    ownerAvatar: "RS",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    deadline: "2026-11-05",
    priority: "High",
    status: "In Progress",
    daysLeft: 5,
    isOverdue: false
  },
  {
    id: "tsk-002",
    title: "Complete Dashboard UI Components & Layout",
    description: "Build responsive KPI cards, meeting history table, and quick filter controls with Soft Sage styling.",
    owner: "Priya Patel",
    ownerAvatar: "PP",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    deadline: "2026-11-03",
    priority: "High",
    status: "In Progress",
    daysLeft: 3,
    isOverdue: false
  },
  {
    id: "tsk-003",
    title: "Setup MongoDB Indexing & Atlas Vector Search",
    description: "Configure compound indexes on meetingId and deadline fields for rapid monitoring queries.",
    owner: "Alex Chen",
    ownerAvatar: "AC",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    deadline: "2026-11-06",
    priority: "Medium",
    status: "Pending",
    daysLeft: 6,
    isOverdue: false
  },
  {
    id: "tsk-004",
    title: "Resolve Workspace API Integration Contract",
    description: "Align the request/response schema between backend Express routes and client state stores.",
    owner: "Rahul Sharma",
    ownerAvatar: "RS",
    meetingId: "meet-103",
    meetingTitle: "API Integration & Frontend Alignment",
    deadline: "2026-10-27",
    priority: "High",
    status: "Pending",
    daysOverdue: 4,
    isOverdue: true
  },
  {
    id: "tsk-005",
    title: "Enforce TLS 1.3 & AES-256 Database Encryption",
    description: "Validate encryption keys and security certs on staging cluster before release.",
    owner: "David Kim",
    ownerAvatar: "DK",
    meetingId: "meet-104",
    meetingTitle: "Quarterly Product Security & Compliance",
    deadline: "2026-10-25",
    priority: "Medium",
    status: "Pending",
    daysOverdue: 6,
    isOverdue: true
  },
  {
    id: "tsk-006",
    title: "Publish OpenAPI 3.0 Documentation for Tasks",
    description: "Generate Swagger docs for task state transitions and overdue query parameters.",
    owner: "Rahul Sharma",
    ownerAvatar: "RS",
    meetingId: "meet-103",
    meetingTitle: "API Integration & Frontend Alignment",
    deadline: "2026-10-29",
    priority: "Low",
    status: "Pending",
    daysOverdue: 2,
    isOverdue: true
  },
  {
    id: "tsk-007",
    title: "Deploy MongoDB Atlas Staging Cluster",
    description: "Provision 3-node replica set with IP whitelist and VPC peering enabled.",
    owner: "Alex Chen",
    ownerAvatar: "AC",
    meetingId: "meet-102",
    meetingTitle: "Database Selection & Infrastructure Sync",
    deadline: "2026-10-30",
    priority: "High",
    status: "Completed",
    isOverdue: false
  },
  {
    id: "tsk-008",
    title: "Finalize Soft Sage Color Tokens & Typography",
    description: "Document CSS variables and design tokens in styleguide for developer handoff.",
    owner: "Priya Patel",
    ownerAvatar: "PP",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    deadline: "2026-10-31",
    priority: "Medium",
    status: "Completed",
    isOverdue: false
  }
];

export const INITIAL_DECISIONS = [
  {
    id: "dec-001",
    title: "Adopt MongoDB as Primary Document Store",
    description: "Use MongoDB Atlas for native JSON transcript storage, flexible AI entity schemas, and rich metadata indexing.",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    date: "2026-11-01",
    owner: "Alex Chen",
    category: "Architecture",
    status: "Implemented",
    rationale: "Unstructured meeting summaries and evolving entity attributes are best suited for document storage over relational rigid tables."
  },
  {
    id: "dec-002",
    title: "Standardize API Error Codes Across All Microservices",
    description: "All backend endpoints will return RFC 7807 compliant Problem Details JSON for predictable frontend error handling.",
    meetingId: "meet-101",
    meetingTitle: "Sprint Planning & Core Architecture Review",
    date: "2026-11-01",
    owner: "Rahul Sharma",
    category: "Engineering",
    status: "In Progress",
    rationale: "Prevents inconsistent HTTP status interpretations across disparate client modules."
  },
  {
    id: "dec-003",
    title: "Stateless JWT with 15-Minute Rotating Refresh Tokens",
    description: "Authentication system will not store server-side sessions, relying instead on signed JWTs with encrypted refresh tokens.",
    meetingId: "meet-103",
    meetingTitle: "API Integration & Frontend Alignment",
    date: "2026-10-24",
    owner: "Rahul Sharma",
    category: "Security",
    status: "In Progress",
    rationale: "Reduces server memory overhead and enables horizontal scaling of API nodes."
  },
  {
    id: "dec-004",
    title: "Bi-Weekly Architecture Alignment Sync Cadence",
    description: "Every second Tuesday at 10 AM, tech leads will convene to review open cross-team technical debt and unresolved dependencies.",
    meetingId: "meet-104",
    meetingTitle: "Quarterly Product Security & Compliance",
    date: "2026-10-18",
    owner: "Sarah Jenkins",
    category: "Process",
    status: "Implemented",
    rationale: "Ensures unresolved discussions do not linger into production sprint cycles."
  }
];

export const INITIAL_AI_FOLLOWUP_DATA = {
  outstandingCommitments: [
    {
      task: "Resolve Workspace API Integration Contract",
      owner: "Rahul Sharma",
      originalDeadline: "2026-10-27",
      daysOverdue: 4,
      severity: "High",
      impact: "Blocks Frontend Dashboard integration team from verifying live data feeds."
    },
    {
      task: "Enforce TLS 1.3 & AES-256 Database Encryption",
      owner: "David Kim",
      originalDeadline: "2026-10-25",
      daysOverdue: 6,
      severity: "Medium",
      impact: "Required for SOC2 readiness milestone before staging deployment."
    },
    {
      task: "Publish OpenAPI 3.0 Documentation for Tasks",
      owner: "Rahul Sharma",
      originalDeadline: "2026-10-29",
      daysOverdue: 2,
      severity: "Low",
      impact: "Internal documentation delay."
    }
  ],
  repeatedTopics: [
    {
      topic: "API Contract Integration & Schema Validation",
      frequency: "Appeared in 3 consecutive meetings (Oct 24, Oct 28, Nov 1)",
      recommendation: "Dedicate the first 15 minutes of the next sync to freeze the JSON schema contract between Rahul and Priya.",
      status: "Unresolved"
    },
    {
      topic: "Staging Cluster Network Security & Whitelisting",
      frequency: "Appeared in 2 consecutive meetings (Oct 18, Oct 28)",
      recommendation: "Assign David Kim and Alex Chen to verify security group egress rules in AWS VPC.",
      status: "In Review"
    }
  ],
  pendingDecisions: [
    {
      decision: "Standardize API Error Codes Across All Microservices",
      decidedDate: "2026-11-01",
      champion: "Rahul Sharma",
      nextStep: "Audit auth service endpoints for compliance."
    }
  ],
  suggestedAgenda: [
    {
      time: "10:00 - 10:15 AM",
      topic: "Urgent Review: Overdue API Integration & Contract Freeze",
      leader: "Rahul Sharma & Priya Patel",
      objective: "Sign off on the final JSON schemas to unblock frontend workspace development."
    },
    {
      time: "10:15 - 10:30 AM",
      topic: "Authentication Service Progress & JWT Refresh Rollout",
      leader: "Rahul Sharma",
      objective: "Status update on target Nov 5 delivery."
    },
    {
      time: "10:30 - 10:45 AM",
      topic: "Frontend Dashboard UI & Component Handoff",
      leader: "Priya Patel",
      objective: "Review complete Soft Sage design implementation ahead of Nov 3 deadline."
    },
    {
      time: "10:45 - 10:55 AM",
      topic: "MongoDB Atlas Indexing & Cluster Readiness",
      leader: "Alex Chen",
      objective: "Confirm compound index benchmarking for task query performance."
    },
    {
      time: "10:55 - 11:00 AM",
      topic: "Action Items & Ownership Sign-off",
      leader: "Sarah Jenkins",
      objective: "Lock deadlines and owners into MeetMind AI persistent tracking."
    }
  ]
};

export const SAMPLE_TRANSCRIPT = `Sprint Planning & Core Architecture Review
Meeting Date: November 1, 2026
Attendees: Sarah Jenkins (Product Manager), Rahul Sharma (Backend Lead), Priya Patel (Frontend Lead), Alex Chen (Database Engineer)

Discussion Transcript:
Sarah Jenkins: Good morning everyone. Let's do our sprint planning and finalize key architecture choices for MeetMind AI. Rahul, where are we with authentication?
Rahul Sharma: I have outlined the OAuth 2.0 flow. I will implement stateless JWT authentication with refresh token rotation. I commit to completing the authentication API by November 5.
Sarah Jenkins: Great, November 5 is recorded for Rahul. Priya, how is the dashboard UI coming along?
Priya Patel: The component designs in the soft sage green palette are completed. I will finish the dashboard UI components and responsive layout by November 3.
Sarah Jenkins: Excellent. Alex, what is the conclusion on our database choice?
Alex Chen: We evaluated PostgreSQL vs MongoDB. Given our meeting transcripts, unstructured summaries, and dynamic entity models, the team officially decided to use MongoDB as our primary document store. I will finalize our MongoDB compound indexing strategy by November 6.
Sarah Jenkins: That decision is approved. One important reminder: the API integration contract is still pending from the previous meeting. Rahul and Priya must coordinate to unblock frontend mock data replacement.
Rahul Sharma: Understood, I will prioritize resolving that contract by Monday.`;
