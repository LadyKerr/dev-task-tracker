# Workshop: Build a Task Manager App with GitHub Copilot - Prompts

Let's update this app using GitHub Copilot. We want to implement the following:

## Basic Task Management:
- Add task editing functionality
- allow users to see their completed tasks following this design #file: attach file (Agent Mode; VSCode Insider only)

## Code Quality Improvements:
- refactor the `renderTask` method for better readability (highlight function in script.js and ask Copilot to refactor)
- add input validation to `addTask` method (highlight function in script.js and ask Copilot to add input validation)
- update code to use constants for magic strings (update hard coded selectors, etc.) 
- open script.js and Copilot Chat, type `/test` to generate unit tests for the `TaskManager` class
- Ask Copilot questions: 
    - "is there anything in this file that can be refactored?" (open script.js file - Chat mode) 
    - "What about performance optimizations?" (open script.js file - Chat mode)

## Documentation:
- update the readme for this project (attach all relevant files to the prompt)
- add image to Readme (open inline chat and add image [link](https://github.com/user-attachments/assets/6cde8c43-9510-470e-91c6-6c505f4150e3))

## Code Review in Editor:
- highlight a portion of your code, and click the sparkle icon that pops up and select "Review using Copilot" (this will generate a code review comment)


## Stretch Features:
- Help me implement a pomodoro timer to help users stay focused with options for 15/5, 30/10, 60/20, and custom
- Create a way to categorize tasks with custom tags
- Add a filter to view tasks by category
- Add a feature to export tasks as CSV