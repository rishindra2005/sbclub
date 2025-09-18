# V-Closet: Project Plan

## 1. Project Overview

V-Closet is a virtual trial room application that allows users to see how outfits would look on them without trying them on physically. Users can upload their pictures and describe an outfit, and the application will generate an image of them wearing the described outfit.

## 2. Technology Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Database:** MongoDB
*   **Authentication:** NextAuth.js
*   **AI/Image Generation:** Google Gemini API
*   **Styling:** Tailwind CSS

## 3. Data Models

The data models will be defined using TypeScript interfaces to ensure type safety.

### User Schema (MongoDB)

```typescript
interface User {
  _id: string; // or ObjectId
  name: string;
  email: string;
  password?: string; // Should not be sent to the client
  createdAt: Date;
}
```

### Trial/Chat Schema (MongoDB)

```typescript
interface Message {
  sender: 'user' | 'assistant';
  text?: string;
  imageUrl?: string;
  createdAt: Date;
}

interface Trial {
  _id: string; // or ObjectId
  userId: string; // or ObjectId, ref: 'User'
  name: string;
  messages: Message[];
  createdAt: Date;
}
```

## 4. Authentication

*   **Provider:** NextAuth.js with the Credentials provider for email and password login.
*   **Session Management:** Session-based authentication managed by NextAuth.js.
*   **Protected Routes:** Middleware will be used to protect routes like the dashboard and trial pages, accessible only to authenticated users.
*   **Login Page:** The homepage will serve as the login page.

## 5. Pages and Components (App Router)

### Pages (Routes)

*   `/` (Homepage / Login): `src/app/page.tsx`. A page for users to log in or sign up. After login, it might redirect to the dashboard.
*   `/dashboard`: `src/app/dashboard/page.tsx`. The main page for authenticated users. It will display a list of their past trials/chats.
*   `/trial/[id]`: `src/app/trial/[id]/page.tsx`. The chat/trial interface where users interact with the Gemini chatbot.

### Components

Components will be located in a `src/components` directory (to be created).

*   `LoginForm`: A component for the login form.
*   `TrialList`: A component on the dashboard to display the list of trials.
*   `ChatWindow`: The main component for the chat interface on the `/trial/[id]` page.
*   `Message`: A component to display a single message in the chat.
*   `ImageUploader`: A component to handle user image uploads.
*   `Header`: A navigation header with user information and a logout button.

## 6. Backend API (`/src/app/api`)

API routes will be defined as `route.ts` files within the `src/app/api` directory.

*   `auth/[...nextauth]/route.ts`: Handles all authentication logic (login, logout, session management).
*   `trials/route.ts`:
    *   `GET`: Fetch all trials for the logged-in user.
    *   `POST`: Create a new trial.
*   `trials/[id]/route.ts`:
    *   `GET`: Fetch a specific trial by its ID.
    *   `PUT`: Update a trial (e.g., add a new message).
    *   `DELETE`: Delete a trial.
*   `gemini/generate/route.ts`:
    *   `POST`: Takes user image and text description, interacts with the Gemini API, and returns the generated image. This route will be responsible for the core logic of the virtual trial.

## 7. Development Milestones

### Milestone 1: Project Setup & Authentication (1-2 days)

1.  Confirm Next.js project with TypeScript and Tailwind CSS is set up.
2.  Set up a connection to a MongoDB database.
3.  Define the `User` and `Trial` schemas/models.
4.  Implement NextAuth.js with the Credentials provider for email/password authentication.
5.  Create the login page and protect the dashboard route using middleware.

### Milestone 2: Dashboard and Chat Structure (2-3 days)

1.  Create the dashboard page UI (`src/app/dashboard/page.tsx`).
2.  Implement the API endpoint to fetch and display the list of trials for the logged-in user.
3.  Allow users to create new trials from the dashboard.
4.  Create the basic UI for the chat page (`src/app/trial/[id]/page.tsx`).
5.  Implement API endpoints to fetch and display messages for a specific trial.

### Milestone 3: Chatbot & Gemini Integration (3-4 days)

1.  Build the chat input form on the `/trial/[id]` page.
2.  Implement the `ImageUploader` component to allow users to upload their photos.
3.  Create the `/app/api/gemini/generate/route.ts` API route.
4.  Integrate the Google Gemini API within the `generate` route to process user input (image + text).
5.  Display the generated image from the Gemini API in the chat window.
6.  Store the conversation history (user prompts and AI responses) in the `Trial` document in MongoDB.

### Milestone 4: Styling and Refinement (1-2 days)

1.  Apply consistent and appealing styling to all pages and components using Tailwind CSS.
2.  Ensure the application is responsive and works well on different screen sizes.
3.  Add loading states and error handling for a better user experience.
4.  Perform thorough testing of all features.