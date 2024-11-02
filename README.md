# Animal Behavior Logging Tool

This is a Next.js project for monitoring and logging animal behaviors. The system provides a web interface where researchers and volunteers can log and track animal behaviors for conservation and study purposes.

## Getting Started
You can go to this website to access the app: https://animal-behavior-monitoring.vercel.app/

Or, if you want to run this project locally, please follow these steps after cloning the repo:

1. **Install Dependencies**:
   Make sure you have all the necessary dependencies by running:
   ```bash
   npm install
   ```
   
2. **Set up Convex:**:
   - Create a Convex account at https://dashboard.convex.dev
   - Create a new project in Convex dashboard
   - Get the deployment URL
   - Create a .env.local file in the root directory with:
   ```bash
    NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
    ```

3. **Start the Convex Server**:
   ```bash
   npx convex dev
   ```

4. **Start the development Server**:
   ```bash
   npm run dev
   ```