## Calliope - Full Stack Product Management System
A robust Full Stack web application designed to manage products dynamically through a secure administrative interface. This project showcases the integration of a modern backend with a clean frontend.

### Live Demo
- Frontend: https://calliope-frontend.onrender.com/

- Backend API: https://calliope-backend.onrender.com/

### Tech Stack
- Frontend: Vanilla JavaScript, CSS3, HTML5

- Backend: Node.js, Express.js

- Database: MongoDB Atlas (NoSQL)

- File Management: Multer (for image uploads)

- Deployment: Render (Web Services & Static Sites)

### Key Features
- Secure Admin Dashboard: A protected area to manage content with custom header-based authentication.

- Full CRUD Functionality: Create, Read, Update, and Delete products in real-time.

- Dynamic Image Uploads: Handles image processing and storage using Multer.

- RESTful API: Clean and structured API endpoints for seamless data communication.

- CORS Configuration: Optimized for cross-origin requests between different deployment platforms.

- Automated Uptime: Integrated keep-alive mechanisms to prevent server sleep cycles.

### Challenges & Solutions
- CORS Management: Successfully configured backend headers to allow secure communication between separate frontend and backend deployments.

- Environment Security: Utilized .env files and environment variables on Render to keep sensitive data like MongoDB URIs and passwords secure.

- Relative Path Handling: Resolved complex file path issues during deployment to ensure CSS and images load correctly across different server environments.
