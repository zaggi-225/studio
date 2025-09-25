# **App Name**: Tarpaulin Manager

## Core Features:

- Offline Data Entry: Allows users to enter purchases, sales, and expenses even without an internet connection. Data syncs automatically with Firestore when online.
- Real-time Profit/Loss Calculation: Calculates profits, losses, and investments in real-time based on entered data using Cloud Functions. Calculations should be re-run by a tool upon a new database entry.
- Dashboard & Reports: Provides a simple dashboard with key metrics (sales, expenses, profit) and allows users to export reports in PDF/CSV format.
- Audio Guidance: Pre-recorded audio guidance for illiterate users, explaining how to use each feature of the app.
- Role-Based Access: Implements role-based access control (Admin vs. Worker) using Firebase Authentication to restrict access to certain features.
- Automated notifications: Using cloud functions, the system will generate and push to the user daily local notifications regarding pending entries or reports.
- Emoji-Based UI: Use emojis within the application to visually convey the category and status of an entry. Ensure proper accessibility for users with impaired vision. 

## Style Guidelines:

- Primary color: Forest green (#228B22), symbolizing growth and financial health.
- Background color: Light beige (#F5F5DC), offering a neutral and calming backdrop.
- Accent color: Earthy brown (#A0522D), used for key actions and important information.
- Font: 'PT Sans' (sans-serif) for both body and headlines. Easy to read, even at smaller sizes, and feels modern yet accessible.
- Use clear and simple icons/emojis representing different categories of transactions (purchase, sale, expense).
- Simple and intuitive layout, optimized for use by non-technical users. Large, easy-to-tap buttons.
- Subtle animations (e.g., screen transitions, loading indicators) to enhance usability.