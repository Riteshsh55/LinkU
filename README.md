
    User[User Browser] -->|HTTP/HTTPS| Frontend[React Frontend<br/>Vercel]

    Frontend -->|REST API Calls| Backend[Node.js + Express API<br/>Render]

    Backend -->|Mongoose ODM| Database[(MongoDB Atlas<br/>Cloud Database)]

    Backend -->|JWT Auth| Auth[Authentication & Authorization]

    Backend -->|Click Tracking<br/>Analytics| Analytics[Analytics Engine]

    Backend -->|Priority Engine| Priority[Smart Priority Engine]

    subgraph Frontend Layer
        Frontend
    end

    subgraph Backend Layer
        Backend
        Auth
        Analytics
        Priority
    end

    subgraph Data Layer
        Database
    end
