
# Deploying Campus Compass to Netlify

This guide provides the recommended steps to securely deploy your application to Netlify.

**DO NOT drag and drop the folder.** This method is not secure and will not work because your secret API keys will be exposed and the application will fail.

## Recommended Method: Git-Based Deployment

This is the standard, secure, and most efficient way to host your application.

### Step 1: Push Your Project to a Git Provider

1.  Make sure you have [Git](https://git-scm.com/downloads) installed.
2.  Create a new repository on a provider like [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/).
3.  In your project folder, initialize Git and push your code:
    ```bash
    # In your project's root directory
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin YOUR_GIT_REPOSITORY_URL
    git push -u origin main
    ```
    (Replace `YOUR_GIT_REPOSITORY_URL` with the URL from your Git provider).

### Step 2: Connect Your Repository to Netlify

1.  Log in to your [Netlify](https://app.netlify.com/) account.
2.  Click on **"Add new site"** -> **"Import an existing project"**.
3.  Connect to your Git provider (GitHub, GitLab, etc.).
4.  Select the repository you just created for this project.

### Step 3: Configure Build Settings

Netlify will ask for your site's build settings. Use the following configuration:

*   **Build command:** Leave this **BLANK**. Your project is set up to run without a build step.
*   **Publish directory:** Set this to `.` (a single dot) or leave it as the root of your project. Netlify usually defaults to the project root, which is correct.

### Step 4: Add Environment Variables (Most Important Step)

This is where you will securely add your secret keys.

1.  Before deploying, click on **"Show advanced"** and then **"New variable"**.
2.  You must add a variable for **every single key** from your `env.ts` file. The names must match exactly.

Create the following variables:

| Variable Name                   | Value                                                              | Where to Find It                               |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `ADMIN_USERNAME`                | The username you want for the admin account (e.g., `admin`)        | Your choice                                    |
| `API_KEY`                       | Your Google Gemini API Key                                         | Google AI Studio                               |
| `FIREBASE_API_KEY`              | Your Firebase `apiKey`                                             | Firebase Project Settings -> General           |
| `FIREBASE_AUTH_DOMAIN`          | Your Firebase `authDomain`                                         | Firebase Project Settings -> General           |
| `FIREBASE_PROJECT_ID`           | Your Firebase `projectId`                                          | Firebase Project Settings -> General           |
| `FIREBASE_STORAGE_BUCKET`       | Your Firebase `storageBucket`                                      | Firebase Project Settings -> General           |
| `FIREBASE_MESSAGING_SENDER_ID`  | Your Firebase `messagingSenderId`                                  | Firebase Project Settings -> General           |
| `FIREBASE_APP_ID`               | Your Firebase `appId`                                              | Firebase Project Settings -> General           |

**Security Note:** By using environment variables, your secret keys are never exposed in your code or to website visitors.

### Step 5: Deploy Your Site

1.  Click the **"Deploy site"** button.
2.  Netlify will pull your code from Git, apply the environment variables, and host your site on a public URL.

Your Campus Compass app is now live, secure, and fully functional!
