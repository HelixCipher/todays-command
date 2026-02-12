# Today's Command - Linux Desktop Widget


<img align="left" width="250" height="250" src="https://raw.githubusercontent.com/HelixCipher/todays-command/main/logo.png">

A desktop widget for Linux that delivers daily Linux, Python, and SQL commands with interactive quizzes, streak tracking, and customizable reminders.

<br><br>
<br><br>


## What is Today's Command?

**Today's Command** is a lightweight desktop widget designed to help developers and Linux users learn something new every day. Instead of scrolling through documentation or searching for commands, the widget delivers a curated command directly to your desktop with explanations and interactive quizzes.

![Widget Preview](project_demonstration_gif.gif)

### Key Features

- **Daily Commands**: Learn a new Linux, Python, or SQL command every day
- **Interactive Quizzes**: Test your knowledge with multiple-choice questions
- **Streak Tracking**: Build a learning habit with daily streaks
- **Customizable Reminders**: Set when and how you want to be reminded
- **Drag & Drop**: Move the widget anywhere on your screen
- **Clean Design**: Modern, transparent widget that blends with your desktop
- **Linux Native**: Built specifically for Linux desktop environments

## Installation

### Prerequisites
- Ubuntu/Debian-based Linux distribution (or compatible)
- 64-bit system architecture

### Quick Install

```bash
# Download the latest release
wget https://github.com/HelixCipher/todays-command/releases/latest/download/todays-command.deb

# Install the package
sudo dpkg -i todays-command.deb

# Fix any missing dependencies (if needed)
sudo apt-get install -f
```

### Build from Source

If you prefer to build from source:

```bash
# Clone the repository
git clone https://github.com/HelixCipher/todays-command.git
cd todays-command

# Run the automated installer
./install.sh
```

The installer will automatically:
- Detect your Linux distribution
- Install Node.js and Rust (if not present)
- Install all system dependencies
- Build and install the application

## Uninstallation

To completely remove Today's Command from your system, use the provided uninstall script:

```bash
# Run the uninstall script
./uninstall.sh
```

The uninstall script will:
- Stop any running instances of the widget
- Remove system-wide packages (.deb, .rpm, AppImage)
- Remove user-local installations
- Delete all configuration files and user data
- Remove desktop entries and icons
- Clean up autostart entries
- Restore your PATH if modified

**Interactive Mode (default):**
The script will ask for confirmation before removing anything.

**Silent Mode:**
To skip the confirmation prompt (useful for automation):
```bash
./uninstall.sh --yes
```

**What gets removed:**
- Application binaries and libraries
- Configuration files (`~/.config/todays-command/`)
- User data (streaks, quiz history, settings)
- Desktop entries and application menu items
- System tray icons
- Cache files
- Build artifacts (optional)

**Note:** Your learning progress and streaks will be permanently deleted. Make sure you really want to uninstall before proceeding.

## How to Use

### Getting Started

1. **Launch the Widget**
   ```bash
   todays-command
   ```
   Or find "Today's Command" in your applications menu.

2. **First Run**
   - The widget will appear automatically on first launch
   - You'll see today's command displayed with description and examples

### Widget Controls

| Control | Action |
|---------|--------|
| **Drag Handle** (top bar) | Click and drag to move the widget anywhere on screen |
| **Stats Button** (📊) | View your quiz statistics and learning progress |
| **Quiz Button** (✨) | Take a quiz to test your knowledge |
| **Settings Button** (⚙️) | Configure categories and reminder settings |
| **Minimize Button** (−) | Hide widget to system tray |

### Using the System Tray Icon

When minimized, the widget lives in your system tray (top panel on Ubuntu):

- **Left-click**: Show/hide the widget
- **Right-click**: Open menu with Show/Hide/Quit options

### Command Categories

Switch between different command categories in Settings:

- **Linux**: Bash commands, file operations, system management
- **Python**: Python syntax, libraries, best practices
- **SQL**: Database queries, commands, and optimizations
- **Shuffle**: Random category each day for variety

## ⚙️ Configuration

### Setting Up Reminders

1. Click the **Settings** button (⚙️) in the widget header
2. Scroll to "Widget Behavior" section
3. Check **"Enable daily reminders"**
4. Choose your reminder time:
   - Select from preset times (06:00 - 20:00)
   - Or enable "Use custom time" for precise control (e.g., 07:30, 14:45)
5. Select notification type:
   - **System notification only**: Shows desktop notification
   - **Auto-show widget**: Widget appears automatically
   - **Both**: Notification + auto-show
6. Click **"Save Settings"**

### Reminder Options

- **Skip weekends**: Don't show reminders on Saturday/Sunday
- **Play notification sound**: Audio alert when reminder triggers
- **Missed reminder behavior**: Choose what happens if you miss the reminder time

### Example: Setting a Custom Reminder

1. Open Settings → Widget Behavior
2. Enable reminders
3. Check "Use custom time"
4. Enter time: `09:30` (for 9:30 AM)
5. Select "Both" for notification type
6. Save settings

The widget will now automatically appear every day at 9:30 AM!

## Interactive Features

### Taking Quizzes

1. Click the **Quiz** button (✨)
2. Answer 5 multiple-choice questions
3. Get instant feedback on your answers
4. See your score and review explanations
5. Build your streak by taking quizzes daily!

### Tracking Your Progress

- **Current Streak**: Number of consecutive days you've used the widget
- **Longest Streak**: Your personal best streak
- **Quiz Statistics**: View your quiz scores and accuracy
- **Command History**: See previous commands you've learned

## Troubleshooting

### Widget Not Showing Reminders

1. Check that reminders are enabled in Settings
2. Verify the reminder time is set correctly
3. Ensure "Auto-show widget" or "Both" is selected as notification type
4. Wait up to 30 seconds (checks every 30 seconds)

### Minimize Button Not Working

The minimize button hides the widget to the system tray. Look for the Today's Command icon in your top panel and click it to show the widget again.

### Can't Drag the Widget

Make sure you're clicking on the **grey drag handle bar** at the very top of the widget, then drag to move.

### Settings Not Saving

1. Make changes in the Settings panel
2. Scroll down and click **"Save Settings"** button
3. Settings are automatically saved to local storage

### Build Issues

If building from source fails:

```bash
# Install required system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev

# Then retry the install script
./install.sh
```

## 📝 Daily Workflow Example

**Morning Routine:**
1. Widget appears automatically at your set reminder time (e.g., 9:00 AM)
2. Read the daily command and description
3. Try the command in your terminal
4. Click the Quiz button to test your understanding

**Throughout the Day:**
1. Minimize widget to system tray when not needed
2. Click system tray icon anytime to reference the command
3. View stats to track your learning progress

**Building Streaks:**
1. Use the widget daily to maintain your streak
2. Take quizzes to reinforce learning
3. Switch categories to learn different types of commands

## Customization

### Changing Categories

Switch command categories anytime:

1. Open Settings
2. Select a category: Linux, Python, SQL, or Shuffle
3. Click Save Settings
4. The widget will immediately show commands from the new category

### Moving the Widget

The widget stays where you put it:

1. Click and hold the drag handle (top grey bar)
2. Move to desired location
3. Release to drop
4. Position persists between sessions


---

## License & Attribution

This project is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

You are free to **use, share, copy, modify, and redistribute** this material for any purpose (including commercial use), **provided that proper attribution is given**.

### Attribution requirements

Any reuse, redistribution, or derivative work **must** include:

1. **The creator’s name**: `HelixCipher`
2. **A link to the original repository**:  
   https://github.com/HelixCipher/todays-command
3. **An indication of whether changes were made**
4. **A reference to the license (CC BY 4.0)**

#### Example Attribution

> This work is based on *Today's Command* by `HelixCipher`.  
> Original source: https://github.com/HelixCipher/todays-command
> Licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0).

You may place this attribution in a README, documentation, credits section, or other visible location appropriate to the medium.

Full license text: https://creativecommons.org/licenses/by/4.0/


---

## Disclaimer

This project is provided **“as—is”**. The author accepts no responsibility for how this material is used. There is **no warranty** or guarantee that the scripts are safe, secure, or appropriate for any particular purpose. Use at your own risk.

see [DISCLAIMER.md](./DISCLAIMER.md) for full terms. Use at your own risk.