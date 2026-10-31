import { Meeting } from '../models/Meeting.js';
import { Task } from '../models/Task.js';
import { Decision } from '../models/Decision.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const meetingCount = await Meeting.countDocuments();
    if (meetingCount > 0) {
      console.log(`[Seed] Database already has ${meetingCount} meetings. Skipping auto-seed.`);
      return;
    }

    console.log('[Seed] Database is empty. Seeding initial MeetMind AI records...');

    // 1. Meeting 1: Sprint Planning & Core Architecture Review
    const meet1 = await Meeting.create({
      title: 'Sprint Planning & Core Architecture Review',
      date: '2026-11-01',
      time: '10:00 AM - 11:15 AM',
      duration: '75 mins',
      status: 'Approved',
      participants: [
        { name: 'Rahul Sharma', role: 'Backend Lead', avatar: 'RS', color: '#426B50' },
        { name: 'Priya Patel', role: 'Frontend Lead', avatar: 'PP', color: '#8DAF91' },
        { name: 'Alex Chen', role: 'Database Engineer', avatar: 'AC', color: '#2D6A8E' },
        { name: 'Sarah Jenkins', role: 'Product Manager', avatar: 'SJ', color: '#8B7355' }
      ],
      summary: 'The team finalized the technical roadmap for the upcoming sprint. Key focus areas include completing the OAuth 2.0 authentication service, delivering responsive dashboard UI components, and proceeding with the planned MongoDB database migration. Outstanding cross-team API contract alignment was flagged as a critical dependency.',
      discussionPoints: [
        {
          topic: 'Authentication Architecture',
          notes: 'Evaluated session vs JWT tokens. Decided to proceed with stateless JWT tokens with refresh rotation for API scalability.',
          speaker: 'Rahul Sharma'
        },
        {
          topic: 'Dashboard UI & Design System',
          notes: 'Priya confirmed the soft sage green SaaS theme is ready for component migration. Frontend team needs verified API schemas by Nov 3.',
          speaker: 'Priya Patel'
        },
        {
          topic: 'MongoDB Cluster Setup',
          notes: 'Alex presented the replica set configuration on MongoDB Atlas with automated daily snapshots.',
          speaker: 'Alex Chen'
        },
        {
          topic: 'Unresolved API Integration',
          notes: 'Identified that the backend-frontend integration for user workspaces is carried over from the Oct 24 sync and needs prompt resolution.',
          speaker: 'Sarah Jenkins'
        }
      ],
      transcript: `Sprint Planning & Core Architecture Review
Date: Nov 1, 2026
Attendees: Rahul Sharma, Priya Patel, Alex Chen, Sarah Jenkins

Key Discussion:
- Rahul must complete the authentication API by November 5.
- Priya must complete the dashboard UI by November 3.
- Alex will finalize the MongoDB indexing strategy by November 6.
- The team officially decided to use MongoDB as the document store.
- Team agreed to standardize API response error codes across all microservices.
- Note: The API integration is still pending from the previous meeting and Rahul needs to coordinate with Priya.`
    });

    // 2. Meeting 2: Database Selection & Infrastructure Sync
    const meet2 = await Meeting.create({
      title: 'Database Selection & Infrastructure Sync',
      date: '2026-10-28',
      time: '02:30 PM - 03:30 PM',
      duration: '60 mins',
      status: 'Approved',
      participants: [
        { name: 'Alex Chen', role: 'Database Engineer', avatar: 'AC', color: '#2D6A8E' },
        { name: 'Rahul Sharma', role: 'Backend Lead', avatar: 'RS', color: '#426B50' },
        { name: 'Sarah Jenkins', role: 'Product Manager', avatar: 'SJ', color: '#8B7355' }
      ],
      summary: 'Comprehensive architectural review comparing PostgreSQL vs MongoDB for meeting intelligence schemas and flexible transcription metadata.',
      discussionPoints: [
        {
          topic: 'Document Schema Flexibility',
          notes: 'Meeting transcripts and unstructured AI outputs benefit from document modeling rather than rigid relational joins.',
          speaker: 'Alex Chen'
        },
        {
          topic: 'Indexing & Vector Support',
          notes: 'MongoDB Atlas search and vector index capabilities satisfy our upcoming agent retrieval specifications.',
          speaker: 'Rahul Sharma'
        }
      ],
      transcript: 'Evaluated DB alternatives. Unanimous agreement to adopt MongoDB.'
    });

    // 3. Meeting 3: API Integration & Frontend Alignment
    const meet3 = await Meeting.create({
      title: 'API Integration & Frontend Alignment',
      date: '2026-10-24',
      time: '11:00 AM - 12:00 PM',
      duration: '60 mins',
      status: 'Approved',
      participants: [
        { name: 'Rahul Sharma', role: 'Backend Lead', avatar: 'RS', color: '#426B50' },
        { name: 'Priya Patel', role: 'Frontend Lead', avatar: 'PP', color: '#8DAF91' },
        { name: 'David Kim', role: 'QA Engineer', avatar: 'DK', color: '#C98818' }
      ],
      summary: 'Cross-functional review on REST endpoints for user authentication, workspace provisioning, and meeting agenda synchronization.',
      discussionPoints: [
        {
          topic: 'Swagger API Documentation',
          notes: 'Rahul to publish OpenAPI 3.0 specs for meetings and task controllers.',
          speaker: 'Rahul Sharma'
        },
        {
          topic: 'Integration Blocker',
          notes: 'Frontend team blocked on user profile payload schema changes.',
          speaker: 'Priya Patel'
        }
      ],
      transcript: 'Meeting to resolve API mismatches. API integration remains pending.'
    });

    // 4. Meeting 4: Quarterly Product Security & Compliance
    const meet4 = await Meeting.create({
      title: 'Quarterly Product Security & Compliance',
      date: '2026-10-18',
      time: '03:00 PM - 04:00 PM',
      duration: '60 mins',
      status: 'Approved',
      participants: [
        { name: 'David Kim', role: 'QA Engineer', avatar: 'DK', color: '#C98818' },
        { name: 'Sarah Jenkins', role: 'Product Manager', avatar: 'SJ', color: '#8B7355' },
        { name: 'Rahul Sharma', role: 'Backend Lead', avatar: 'RS', color: '#426B50' }
      ],
      summary: 'Review of SOC2 compliance requirements, API token expiration rules, and data encryption at rest for meeting transcripts.',
      discussionPoints: [
        {
          topic: 'Encryption Standards',
          notes: 'All sensitive meeting notes must be encrypted using AES-256 in MongoDB.',
          speaker: 'David Kim'
        }
      ],
      transcript: 'Security audit preparation.'
    });

    // Insert Tasks with real MongoDB ObjectIds
    await Task.insertMany([
      {
        title: 'Complete Authentication API with JWT Refresh',
        description: 'Implement OAuth 2.0 and JWT token generation with 15-minute expiration and rotating refresh tokens.',
        owner: 'Rahul Sharma',
        ownerAvatar: 'RS',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        deadline: '2026-11-05',
        priority: 'High',
        status: 'In Progress'
      },
      {
        title: 'Complete Dashboard UI Components & Layout',
        description: 'Build responsive KPI cards, meeting history table, and quick filter controls with Soft Sage styling.',
        owner: 'Priya Patel',
        ownerAvatar: 'PP',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        deadline: '2026-11-03',
        priority: 'High',
        status: 'In Progress'
      },
      {
        title: 'Setup MongoDB Indexing & Atlas Vector Search',
        description: 'Configure compound indexes on meetingId and deadline fields for rapid monitoring queries.',
        owner: 'Alex Chen',
        ownerAvatar: 'AC',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        deadline: '2026-11-06',
        priority: 'Medium',
        status: 'Pending'
      },
      {
        title: 'Resolve Workspace API Integration Contract',
        description: 'Align the request/response schema between backend Express routes and client state stores.',
        owner: 'Rahul Sharma',
        ownerAvatar: 'RS',
        meetingId: meet3._id,
        meetingTitle: meet3.title,
        deadline: '2026-10-27',
        priority: 'High',
        status: 'Pending'
      },
      {
        title: 'Enforce TLS 1.3 & AES-256 Database Encryption',
        description: 'Validate encryption keys and security certs on staging cluster before release.',
        owner: 'David Kim',
        ownerAvatar: 'DK',
        meetingId: meet4._id,
        meetingTitle: meet4.title,
        deadline: '2026-10-25',
        priority: 'Medium',
        status: 'Pending'
      },
      {
        title: 'Publish OpenAPI 3.0 Documentation for Tasks',
        description: 'Generate Swagger docs for task state transitions and overdue query parameters.',
        owner: 'Rahul Sharma',
        ownerAvatar: 'RS',
        meetingId: meet3._id,
        meetingTitle: meet3.title,
        deadline: '2026-10-29',
        priority: 'Low',
        status: 'Pending'
      },
      {
        title: 'Deploy MongoDB Atlas Staging Cluster',
        description: 'Provision 3-node replica set with IP whitelist and VPC peering enabled.',
        owner: 'Alex Chen',
        ownerAvatar: 'AC',
        meetingId: meet2._id,
        meetingTitle: meet2.title,
        deadline: '2026-10-30',
        priority: 'High',
        status: 'Completed',
        completedAt: new Date('2026-10-30')
      },
      {
        title: 'Finalize Soft Sage Color Tokens & Typography',
        description: 'Document CSS variables and design tokens in styleguide for developer handoff.',
        owner: 'Priya Patel',
        ownerAvatar: 'PP',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        deadline: '2026-10-31',
        priority: 'Medium',
        status: 'Completed',
        completedAt: new Date('2026-10-31')
      }
    ]);

    // Insert Decisions
    await Decision.insertMany([
      {
        title: 'Adopt MongoDB as Primary Document Store',
        description: 'Use MongoDB Atlas for native JSON transcript storage, flexible AI entity schemas, and rich metadata indexing.',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        responsiblePerson: 'Alex Chen',
        category: 'Architecture',
        implementationStatus: 'Implemented',
        rationale: 'Unstructured meeting summaries and evolving entity attributes are best suited for document storage.'
      },
      {
        title: 'Standardize API Error Codes Across All Microservices',
        description: 'All backend endpoints will return RFC 7807 compliant Problem Details JSON for predictable frontend error handling.',
        meetingId: meet1._id,
        meetingTitle: meet1.title,
        responsiblePerson: 'Rahul Sharma',
        category: 'Engineering',
        implementationStatus: 'In Progress',
        rationale: 'Prevents inconsistent HTTP status interpretations across disparate client modules.'
      },
      {
        title: 'Stateless JWT with 15-Minute Rotating Refresh Tokens',
        description: 'Authentication system will not store server-side sessions, relying instead on signed JWTs with encrypted refresh tokens.',
        meetingId: meet3._id,
        meetingTitle: meet3.title,
        responsiblePerson: 'Rahul Sharma',
        category: 'Security',
        implementationStatus: 'In Progress',
        rationale: 'Reduces server memory overhead and enables horizontal scaling of API nodes.'
      },
      {
        title: 'Bi-Weekly Architecture Alignment Sync Cadence',
        description: 'Every second Tuesday at 10 AM, tech leads will convene to review open cross-team technical debt.',
        meetingId: meet4._id,
        meetingTitle: meet4.title,
        responsiblePerson: 'Sarah Jenkins',
        category: 'Process',
        implementationStatus: 'Implemented',
        rationale: 'Ensures unresolved discussions do not linger into production sprint cycles.'
      }
    ]);

    console.log('[Seed] Database successfully seeded with meetings, tasks, and decisions!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};
