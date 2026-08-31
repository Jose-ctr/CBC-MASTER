📚 CBC-MASTER
All-in-One Kenyan CBC Teacher Productivity Toolkit — PP1 to Grade 12
CBC MASTER by Joseph Mbui is a modern, mobile-first Progressive Web App (PWA) designed for individual Kenyan teachers to manage their everyday CBC teaching, planning, assessment, student records, report books, and document-generation tasks from one personal workspace.
Plan. Teach. Assess. Report. — All in one workspace.
🚀 Vision
CBC MASTER aims to make everyday teaching and CBC administration easier for individual teachers by bringing essential teaching tools into one practical digital workspace.
Instead of using multiple disconnected tools for lesson preparation, schemes, assessment, learner records, and reporting, teachers can manage their core CBC workflow from one application.
🎯 Teacher First
CBC MASTER is built primarily for the individual teacher.
The product is not a school-wide management system, ERP, Student Information System, or centralized school administration platform.
A school may have many teachers using CBC MASTER independently, but each teacher has their own personal teaching workspace.
✨ Core Features
📊 Report Books
Create student report records
Manage learner performance
Enter subject results
Calculate totals and averages
Generate performance summaries
Add teacher comments
Save reports locally
Edit and manage report records
Preview reports
Prepare reports for printing
Prepare report data for PDF generation
Support grade-based reporting
Support competency and performance summaries
📚 Schemes of Work
Create curriculum schemes
Select grade
Select subject
Organize work by term
Record weeks
Record lessons
Add learning activities
Add teaching resources
Save schemes locally
Edit schemes
Delete schemes
Prepare schemes for printing/export
📝 Lesson Plans
Create daily lesson plans
Select grade
Select subject
Define learning objectives
Define learning outcomes
Add learning activities
Add teaching resources
Record assessment methods
Add teacher reflections
Save lesson plans
Edit lesson plans
Delete lesson plans
Prepare lesson plans for printing/export
🎯 Assessment Rubrics
Create assessment criteria
Define performance levels
Record learner achievement
Build reusable assessment rubrics
Save assessment templates
Edit and manage saved rubrics
👨‍🎓 Students
Add students
Edit student information
Organize learners by grade/class
Search students
Filter students
View student records
Connect students with report books
Maintain learner performance information
📁 Saved Documents
View saved teaching documents
Manage generated content
Organize documents
Search documents
Edit documents
Delete documents
Print documents
Prepare documents for export
👤 Teacher Profile
Store teacher information
Set current teaching grade
Personalize the workspace
Manage teacher preferences
Maintain local teacher information
📈 Insights
Student statistics
Report statistics
Document statistics
Workspace overview
Performance summaries
Grade-level information
📄 Report Generation
CBC MASTER includes a dedicated report-generation architecture for preparing teacher reporting data.
Current report-generation development includes:
Report data structures
Report storage
Report records
Subject performance data
Performance calculations
Report summaries
Competency summaries
Report preview architecture
Report generation data engine
Local report persistence
Future print/PDF output
🎓 Supported CBC Grades
CBC MASTER supports the complete CBC grade progression from Pre-Primary through Senior School.
Level
Grades
Pre-Primary
PP1
Pre-Primary
PP2
Primary
Grade 1
Primary
Grade 2
Primary
Grade 3
Primary
Grade 4
Primary
Grade 5
Primary
Grade 6
Junior School
Grade 7
Junior School
Grade 8
Junior School
Grade 9
Senior School
Grade 10
Senior School
Grade 11
Senior School
Grade 12
Complete CBC Grade Order
const GRADE_MAP = {
  "Pre-Primary": ["PP1", "PP2"],

  "Primary": [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6"
  ],

  "Junior School": [
    "Grade 7",
    "Grade 8",
    "Grade 9"
  ],

  "Senior School": [
    "Grade 10",
    "Grade 11",
    "Grade 12"
  ]
};

const CBC_GRADES_ORDER = [
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12"
];
Supported Grade Count
14 grades
PP1
PP2
Grade 1
Grade 2
Grade 3
Grade 4
Grade 5
Grade 6
Grade 7
Grade 8
Grade 9
Grade 10
Grade 11
Grade 12
The authoritative application grade order starts with PP1 and ends with Grade 12.
💰 Teacher Pricing
CBC MASTER Premium
🇰🇪 KSh 300
CBC MASTER Premium is designed for individual teachers.
The pricing model is intentionally simple and affordable rather than being structured as a school-wide subscription.
Premium Access
Premium functionality may include access to enhanced CBC MASTER tools such as:
📚 Advanced teaching tools
📊 Report Books
📝 Lesson Plans
📚 Schemes of Work
🎯 Assessment Rubrics
👨‍🎓 Student management
📁 Saved Documents
📄 Report generation
📈 Performance summaries
🔄 Continued feature improvements
CBC MASTER Premium — KSh 300
Pricing and included features may change as the product continues to evolve.
🎯 Product Model
CBC MASTER follows a simple teacher-first model:
ONE TEACHER
             │
             ▼
     PERSONAL WORKSPACE
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
   PLAN    TEACH    ASSESS
             │
             ▼
           REPORT
Teacher Workflow
Plan
 ↓
Teach
 ↓
Assess
 ↓
Record
 ↓
Report
CBC MASTER brings these activities together into one teacher workspace.
🏫 Schools
CBC MASTER can be used by teachers working in schools, but the core product is not a school management platform.
CBC MASTER does not primarily target:
School-wide accounting
School fee management
Payroll
Admissions management
Boarding management
Transport management
School-wide ERP
Centralized school administration
These areas are outside the core CBC MASTER product scope.
The application is focused on the teacher's daily CBC productivity workflow.
🧱 Technology Stack
CBC MASTER is built using lightweight web technologies:
HTML5
CSS3
JavaScript
LocalStorage
Progressive Web App (PWA)
Service Worker
Web App Manifest
The application intentionally avoids a heavy frontend framework, keeping it lightweight, responsive, portable, and easy to deploy.
📱 Mobile-First Design
CBC MASTER is designed primarily for mobile devices while maintaining desktop compatibility.
The interface includes:
Responsive layouts
Mobile navigation
Bottom navigation
Slide-out sidebar
Touch-friendly controls
Safe-area support
Responsive desktop layout
Offline-ready architecture
Mobile-app-like experience
💾 Local Data
The current application uses browser localStorage for core local workspace data.
Example storage areas include:
cbc_teacher
cbc_current_grade
cbc_students
cbc_reports
cbc_documents
This allows the core teacher workspace to operate without requiring a server or database.
Future versions may introduce:
Secure cloud synchronization
Teacher accounts
Authentication
Cloud backups
Multi-device synchronization
Online services
📴 PWA Support
CBC MASTER includes Progressive Web App functionality through:
manifest.json
service-worker.js
The PWA architecture is designed to support:
Installation on supported devices
Offline access
Cached application resources
Mobile-app-like experience
Future background capabilities
🗂️ Project Structure
CBC-MASTER/
│
├── index.html
├── manifest.json
├── service-worker.js
├── questions.json
├── icons/
│
└── README.md
The project is being expanded progressively as individual CBC MASTER modules are implemented.
🛠️ Development Roadmap
Phase 1 — Foundation
Responsive application shell
CBC MASTER branding
Dashboard
Sidebar navigation
Bottom navigation
LocalStorage foundation
Teacher profile foundation
Grade selector
Dashboard statistics
Toast notifications
PWA foundation
Phase 2 — Core Application
Application navigation
Grade management
Subject management
Local data structures
Core UI components
Teacher workspace foundation
Phase 3 — Report Books
Report book architecture
Report book data
Student report records
Subject results
Automatic calculations
Performance summaries
Teacher comments
Report storage
Report editing
Report preview architecture
Competency summary architecture
Phase 4 — Schemes of Work
Scheme creation architecture
Grade selection
Subject selection
Term management
Weekly planning
Learning activities
Teaching resources
Local storage
Scheme management
Phase 5 — Lesson Plans
Lesson plan builder architecture
Grade selection
Subject selection
Learning outcomes
Activities
Resources
Assessment
Teacher reflection
Local storage
Lesson plan management
Phase 6 — Assessment Rubrics
Rubric builder architecture
Criteria management
Performance levels
Learner assessment structure
Saved rubric architecture
Phase 7 — Students
Student registration architecture
Student records
Grade/class organization
Student search
Student filtering
Student profiles
Report-book integration architecture
Phase 8 — Saved Documents
Saved document architecture
Document storage
Document categories
Search
Edit
Delete
Document management
Phase 9 — Insights & Analytics
Workspace statistics architecture
Student statistics
Report statistics
Document statistics
Performance summary architecture
Grade-level information
Phase 10 — PWA & Production
PWA foundation
Service worker
Manifest
Responsive interface
Mobile optimization
Extended offline caching
Production performance optimization
Full cross-browser testing
Phase 11 — Advanced CBC Features
Advanced report-book architecture
Competency summaries
Report preview
Extended grade support
Grade-dependent data structures
Expanded CBC workflow architecture
Phase 12 — Report Generation
PART 12A — Report Generation Data & Storage Engine
Report generation data structures
Report storage engine
Report record management
Report data preparation
Local persistence architecture
PART 12B — Report Generation UI
Report generation interface
Report configuration
Report rendering
Print preparation
PDF output integration
PART 12C — Final Reporting & Export
Complete report generation workflow
Final report templates
Printable reports
PDF generation
Export improvements
Final report testing
🔢 Development Structure
CBC MASTER is developed incrementally in structured parts.
PART 1
Foundation
    ↓
PART 2
Core Application / Navigation
    ↓
PART 3
Report Books
    ↓
PART 4
Schemes of Work
    ↓
PART 5
Lesson Plans
    ↓
PART 6
Assessment Rubrics
    ↓
PART 7
Students
    ↓
PART 8
Saved Documents
    ↓
PART 9
Insights
    ↓
PART 10
PWA & Production
    ↓
PART 11
Advanced CBC Features
    ↓
PART 12
Report Generation
Each major part is implemented, tested, and committed progressively to maintain a clean and traceable development history.
🇰🇪 Built for Kenyan CBC
CBC MASTER is designed with the Kenyan Competency-Based Curriculum environment in mind.
The application supports a complete grade-aware workflow covering:
PP1 → PP2
     ↓
Grade 1 → Grade 6
     ↓
Grade 7 → Grade 9
     ↓
Grade 10 → Grade 12
CBC MASTER is intended as a teacher productivity tool and should be used alongside:
Official curriculum designs
KICD materials
KNEC requirements
School policies
Institutional assessment requirements
Official education guidelines
🔐 Privacy
The current version stores core workspace information locally in the user's browser.
No account or cloud database is required for the core local functionality.
Future versions may introduce:
Secure authentication
Cloud synchronization
Encrypted backups
Teacher accounts
Multi-device synchronization
Account-based services
💡 Project Goal
The goal is simple:
Give every teacher one practical workspace for planning, teaching, assessing, and reporting.
CBC MASTER is being developed incrementally, with each major module becoming functional before moving to the next stage.
👨‍💻 Developer
Joseph Mbui
Electrical Engineer & Software Developer
Founder — ThinkPlus Kenya 🇰🇪
GitHub: Jose-ctr
🌐 Live Application
CBC MASTER
https://cbc-master.vercel.app/
📜 License
Copyright © 2026 Joseph Mbui / ThinkPlus.
All rights reserved unless otherwise specified by the repository license.
⭐ Support the Project
If CBC MASTER is useful to you:
⭐ Star the repository
🐛 Report bugs
💡 Suggest features
🔧 Contribute improvements
📢 Share the project with other educators
📚 CBC MASTER
Plan. Teach. Assess. Report.
PP1 → Grade 12 — One teacher. One workspace. One CBC toolkit. 🇰🇪
