# Jordy Life OS v2.0

A comprehensive personal productivity and mindfulness system built entirely with vanilla HTML, CSS, and JavaScript. Perfect for GitHub Pages hosting.

## ✨ Features

### 📊 Dashboard

- **Focus Pulse**: Real-time overview of your task completion rate
- **Quick Stats**: Today’s tasks, pending items, current streak, and journal entries
- **Quick Tasks**: View and complete your most important tasks
- **Active Goals Preview**: Track progress on your goals
- **Latest Reflection**: See your most recent journal entry

### ✅ Habits & Tasks

- **Task Management**: Create, edit, and delete tasks with ease
- **Categories**: Organize tasks by Work, Personal, Health, Learning, Finance (customizable)
- **Priority Levels**: High, Medium, Low priority indicators
- **Due Dates**: Set deadlines for your tasks
- **Filtering**: Filter by status (All/Active/Completed) and category
- **Progress Tracking**: Visual progress bars and completion statistics

### 📓 Journal

- **Daily Reflections**: Write and save your thoughts
- **Mood Tracking**: Select from 6 different mood emojis
- **Chronological View**: Entries displayed with dates and moods
- **Entry Management**: Delete entries you no longer need

### 🎯 Goals

- **Goal Setting**: Create long-term goals with targets
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Categories**: Organize goals by category
- **Deadlines**: Set target dates for your goals
- **Quick Updates**: Increment/decrement progress with +/- buttons
- **Completion Status**: Clear visual indicators when goals are achieved

### ⚙️ Settings

- **Category Management**: Add or remove custom categories
- **Statistics**: View lifetime stats (total completed, streaks, entries)
- **Data Export**: Download all your data as JSON backup
- **Data Import**: Restore from a previous backup
- **Reset Option**: Clear all data if needed

## 🚀 Getting Started

### Local Development

1. Clone or download these files to a folder
1. Open `index.html` in your browser
1. Start organizing your life!

### GitHub Pages Deployment

1. Create a new GitHub repository
1. Upload `index.html`, `app.js`, and `styles.css`
1. Go to Settings → Pages
1. Select your main branch as the source
1. Your Life OS will be live at `https://[username].github.io/[repo-name]`

## 💾 Data Storage

All data is stored locally in your browser’s localStorage:

- **Persistent**: Data survives browser restarts
- **Private**: Stored only on your device
- **Portable**: Export/import feature for backups

### Data Backup Recommendations

- Export your data weekly using the Settings → Export Data feature
- Store backups in a safe location (cloud storage, USB drive)
- Before clearing browser data, export your Life OS data first

## 🎨 Customization

### Color Palette

The design uses a warm, minimal aesthetic. Edit these CSS variables in `styles.css`:

```css
:root {
    --cream: #FDFBF7;    /* Background */
    --sage: #81B29A;     /* Success/Progress */
    --coral: #E07A5F;    /* Danger/Delete */
    --navy: #3D405B;     /* Accent */
    --yellow: #F2CC8F;   /* Highlight */
}
```

### Categories

Default categories: Work, Personal, Health, Learning, Finance

Add more in Settings → Categories or edit the initial categories in `app.js`:

```javascript
categories: ["Work", "Personal", "Health", "Learning", "Finance", "Your Category"]
```

## 📱 Mobile Friendly

The interface is fully responsive:

- Touch-optimized buttons and interactions
- Bottom navigation for easy thumb access
- Smooth scrolling and transitions
- Works on phones, tablets, and desktop

## 🔒 Privacy

- **No tracking**: Zero analytics or third-party scripts
- **No server**: Everything runs in your browser
- **No accounts**: No sign-up or login required
- **Local storage**: Your data never leaves your device

## 🛠️ Technical Stack

- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: No frameworks or dependencies
- **LocalStorage API**: Client-side data persistence

## 📝 Usage Tips

### Tasks

- Use **High Priority** for urgent, important tasks
- Set **Due Dates** for time-sensitive items
- Use **Categories** to filter and focus on specific areas
- Complete tasks daily to build your streak

### Journal

- Write regularly to track your mental state
- Use **Mood Tracking** to identify patterns
- Be honest and authentic in your entries
- Review past entries to see your growth

### Goals

- Make goals **SMART** (Specific, Measurable, Achievable, Relevant, Time-bound)
- Break large goals into smaller milestones
- Update progress regularly to stay motivated
- Celebrate when you hit 100%!

## 🆕 What’s New in v2.0

- ✅ Goals tracking with progress bars
- 🎭 Mood tracking in journal entries
- 🏷️ Task categories and priorities
- 📅 Due dates for tasks
- 🔍 Advanced filtering options
- 📊 Enhanced statistics dashboard
- 💾 Data export/import functionality
- 🎨 Refined UI with better mobile experience
- ⚡ Performance improvements
- 🎯 5-tab navigation with Goals page

## 🐛 Troubleshooting

**My data disappeared!**

- Check if you cleared browser data/cookies
- Import from your latest backup
- Data is browser-specific (Chrome data won’t show in Firefox)

**The app looks broken**

- Clear browser cache and refresh
- Ensure all three files are in the same directory
- Check browser console for errors (F12)

**Tasks not saving**

- Ensure cookies/localStorage is enabled in browser
- Check available storage space
- Try exporting and importing data

## 📄 License

Free to use and modify. No attribution required.

## 🤝 Contributing

This is a personal project, but feel free to:

- Fork and customize for your needs
- Share improvements
- Report issues
- Suggest features

## 📬 Support

For questions or issues:

- Check the browser console for errors
- Export your data before trying fixes
- Search for similar JavaScript localStorage issues online

-----

**Built with ❤️ for productivity and peace of mind**

Version 2.0 | Last Updated: February 2026