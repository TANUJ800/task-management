class TaskManager {
  constructor() {
    this.tasks = []
    this.teamMembers = [
      {
        id: "1",
        name: "Alex Chen",
        email: "alex@company.com",
        initials: "AC",
        role: "admin",
        status: "online",
        lastSeen: "now",
        productivity: 95,
        tasksCompleted: 24,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        initials: "SJ",
        role: "member",
        status: "online",
        lastSeen: "2 minutes ago",
        productivity: 88,
        tasksCompleted: 18,
      },
      {
        id: "3",
        name: "Mike Rodriguez",
        email: "mike@company.com",
        initials: "MR",
        role: "member",
        status: "away",
        lastSeen: "15 minutes ago",
        productivity: 92,
        tasksCompleted: 21,
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily@company.com",
        initials: "ED",
        role: "viewer",
        status: "offline",
        lastSeen: "1 hour ago",
        productivity: 85,
        tasksCompleted: 15,
      },
    ]

    this.currentUser = this.teamMembers[0]
    this.notifications = []
    this.activities = []
    this.liveCursors = []
    this.connectionStatus = "connected"
    this.filters = {
      priority: [],
      status: [],
      search: "",
    }

    this.draggedTask = null
    this.dragOffset = { x: 0, y: 0 }

    this.init()
    this.loadSampleData()
    this.startRealtimeSimulation()
  }

  init() {
    this.setupEventListeners()
    this.setupDragAndDrop()
    this.renderTeamAvatars()
    this.renderBoard()
    this.updateStats()
  }

  setupEventListeners() {
    // Header actions
    document.getElementById("add-task-btn").addEventListener("click", () => this.openTaskModal())
    document.getElementById("filter-toggle").addEventListener("click", () => this.toggleFilters())
    document.getElementById("team-toggle").addEventListener("click", () => this.toggleTeamPanel())
    document.getElementById("notifications-btn").addEventListener("click", () => this.toggleNotifications())
    document.getElementById("search-input").addEventListener("input", (e) => this.handleSearch(e.target.value))

    // Modal events
    document.getElementById("close-modal").addEventListener("click", () => this.closeTaskModal())
    document.getElementById("cancel-task").addEventListener("click", () => this.closeTaskModal())
    document.getElementById("task-form").addEventListener("submit", (e) => this.handleTaskSubmit(e))

    // Detail modal events
    document.getElementById("close-detail-modal").addEventListener("click", () => this.closeTaskDetailModal())

    // Panel events
    document.getElementById("close-team-panel").addEventListener("click", () => this.toggleTeamPanel())

    // Filter events
    document.getElementById("clear-filters").addEventListener("click", () => this.clearFilters())

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilterToggle(e))
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyboardShortcuts(e))

    // Mouse tracking for live cursors
    document.addEventListener("mousemove", (e) => this.updateCursor(e))

    // Click outside to close modals
    document.addEventListener("click", (e) => this.handleOutsideClick(e))
  }

  setupDragAndDrop() {
    const containers = document.querySelectorAll(".tasks-container")

    containers.forEach((container) => {
      container.addEventListener("dragover", (e) => this.handleDragOver(e))
      container.addEventListener("drop", (e) => this.handleDrop(e))
      container.addEventListener("dragenter", (e) => this.handleDragEnter(e))
      container.addEventListener("dragleave", (e) => this.handleDragLeave(e))
    })
  }

  loadSampleData() {
    this.tasks = [
      {
        id: "1",
        title: "Design new landing page",
        description: "Create a modern, responsive landing page with improved conversion rates",
        status: "todo",
        priority: "high",
        assignee: this.teamMembers[1],
        dueDate: "2024-01-15",
        tags: ["design", "frontend", "urgent"],
        comments: [],
        watchers: ["1", "2"],
        createdBy: this.currentUser,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z",
        estimatedHours: 16,
        actualHours: 0,
        isFavorite: true,
        subtasks: [
          { id: "1-1", title: "Create wireframes", completed: true },
          { id: "1-2", title: "Design mockups", completed: false },
          { id: "1-3", title: "Implement responsive layout", completed: false },
        ],
      },
      {
        id: "2",
        title: "Set up CI/CD pipeline",
        description: "Configure automated testing and deployment pipeline",
        status: "todo",
        priority: "medium",
        assignee: this.teamMembers[2],
        dueDate: "2024-01-20",
        tags: ["devops", "automation"],
        comments: [],
        watchers: ["1", "3"],
        createdBy: this.currentUser,
        createdAt: "2024-01-09T14:30:00Z",
        updatedAt: "2024-01-09T14:30:00Z",
        estimatedHours: 8,
        actualHours: 0,
      },
      {
        id: "3",
        title: "Implement user authentication",
        description: "Add secure login and registration functionality",
        status: "in-progress",
        priority: "high",
        assignee: this.teamMembers[0],
        dueDate: "2024-01-18",
        tags: ["backend", "security"],
        comments: [
          {
            id: "c1",
            taskId: "3",
            author: this.teamMembers[1],
            content: "Should we use OAuth or traditional email/password?",
            timestamp: "2024-01-11T09:15:00Z",
            mentions: ["1"],
          },
        ],
        watchers: ["1", "2", "3"],
        createdBy: this.currentUser,
        createdAt: "2024-01-08T11:00:00Z",
        updatedAt: "2024-01-11T09:15:00Z",
        lastEditedBy: this.teamMembers[1],
        estimatedHours: 12,
        actualHours: 6,
        subtasks: [
          { id: "3-1", title: "Set up authentication middleware", completed: true },
          { id: "3-2", title: "Create login form", completed: true },
          { id: "3-3", title: "Implement password reset", completed: false },
        ],
      },
      {
        id: "4",
        title: "Database optimization",
        description: "Optimize database queries for better performance",
        status: "review",
        priority: "medium",
        assignee: this.teamMembers[2],
        dueDate: "2024-01-16",
        tags: ["database", "performance"],
        comments: [],
        watchers: ["1", "3"],
        createdBy: this.teamMembers[2],
        createdAt: "2024-01-07T16:20:00Z",
        updatedAt: "2024-01-10T14:45:00Z",
        estimatedHours: 6,
        actualHours: 5,
      },
      {
        id: "5",
        title: "Project setup and configuration",
        description: "Initialize project structure and development environment",
        status: "done",
        priority: "high",
        assignee: this.teamMembers[0],
        dueDate: "2024-01-05",
        tags: ["setup", "configuration"],
        comments: [],
        watchers: ["1"],
        createdBy: this.currentUser,
        createdAt: "2024-01-01T09:00:00Z",
        updatedAt: "2024-01-05T17:30:00Z",
        estimatedHours: 4,
        actualHours: 3,
      },
    ]

    this.renderBoard()
    this.updateStats()
  }

  renderBoard() {
    const statuses = ["todo", "in-progress", "review", "done"]

    statuses.forEach((status) => {
      const container = document.querySelector(`[data-status="${status}"] .tasks-container`)
      const filteredTasks = this.getFilteredTasks().filter((task) => task.status === status)

      container.innerHTML = ""

      filteredTasks.forEach((task) => {
        const taskElement = this.createTaskElement(task)
        container.appendChild(taskElement)
      })

      // Update task count
      const countElement = document.querySelector(`[data-status="${status}"] .task-count`)
      countElement.textContent = filteredTasks.length
    })
  }

  createTaskElement(task) {
    const taskDiv = document.createElement("div")
    taskDiv.className = "task-card"
    taskDiv.draggable = true
    taskDiv.dataset.taskId = task.id

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
    const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

    taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-title">
                    ${task.isFavorite ? '<i class="star-icon"></i>' : ""}
                    ${task.title}
                </div>
                <div class="task-actions">
                    <button class="btn btn-ghost btn-sm" onclick="taskManager.toggleFavorite('${task.id}')">
                        <i class="star-icon"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="taskManager.editTask('${task.id}')">
                        <i class="edit-icon"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="taskManager.deleteTask('${task.id}')">
                        <i class="trash-icon"></i>
                    </button>
                </div>
            </div>
            
            <div class="task-description">${task.description}</div>
            
            ${
              totalSubtasks > 0
                ? `
                <div class="task-progress">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--muted-foreground);">Subtasks</span>
                        <span style="font-size: 0.75rem; color: var(--muted-foreground);">${completedSubtasks}/${totalSubtasks}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            `
                : ""
            }
            
            ${
              task.estimatedHours
                ? `
                <div class="task-due-date">
                    <i class="clock-icon"></i>
                    <span>${task.actualHours || 0}h / ${task.estimatedHours}h</span>
                </div>
            `
                : ""
            }
            
            ${
              task.dueDate
                ? `
                <div class="task-due-date ${isOverdue ? "overdue" : ""}">
                    <i class="calendar-icon"></i>
                    <span>Due ${this.formatDate(task.dueDate)}</span>
                    ${isOverdue ? '<i class="alert-icon"></i>' : ""}
                </div>
            `
                : ""
            }
            
            <div class="task-tags">
                ${task.tags.map((tag) => `<span class="task-tag">${tag}</span>`).join("")}
            </div>
            
            <div class="task-meta">
                <div class="task-assignee">
                    <div class="avatar">
                        ${task.assignee.initials}
                    </div>
                    <span>${task.assignee.name}</span>
                </div>
                <div class="task-priority priority-${task.priority}">
                    ${task.priority}
                </div>
            </div>
        `

    // Add event listeners
    taskDiv.addEventListener("click", () => this.openTaskDetail(task.id))
    taskDiv.addEventListener("dragstart", (e) => this.handleDragStart(e, task))
    taskDiv.addEventListener("dragend", (e) => this.handleDragEnd(e))

    return taskDiv
  }

  getFilteredTasks() {
    let filtered = [...this.tasks]

    // Apply search filter
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search) ||
          task.tags.some((tag) => tag.toLowerCase().includes(search)),
      )
    }

    // Apply priority filter
    if (this.filters.priority.length > 0) {
      filtered = filtered.filter((task) => this.filters.priority.includes(task.priority))
    }

    // Apply status filter
    if (this.filters.status.length > 0) {
      filtered = filtered.filter((task) => this.filters.status.includes(task.status))
    }

    return filtered
  }

  handleDragStart(e, task) {
    this.draggedTask = task
    const rect = e.target.getBoundingClientRect()
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    e.target.classList.add("dragging")

    // Create drag preview
    const preview = document.getElementById("drag-preview")
    preview.innerHTML = e.target.outerHTML
    preview.style.display = "block"
    preview.style.width = rect.width + "px"

    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.target.outerHTML)
  }

  handleDragEnd(e) {
    e.target.classList.remove("dragging")
    document.getElementById("drag-preview").style.display = "none"

    // Remove drag-over class from all containers
    document.querySelectorAll(".tasks-container").forEach((container) => {
      container.classList.remove("drag-over")
    })

    this.draggedTask = null
  }

  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    // Update drag preview position
    const preview = document.getElementById("drag-preview")
    if (preview.style.display !== "none") {
      preview.style.left = e.clientX - this.dragOffset.x + "px"
      preview.style.top = e.clientY - this.dragOffset.y + "px"
    }
  }

  handleDragEnter(e) {
    e.preventDefault()
    e.target.classList.add("drag-over")
  }

  handleDragLeave(e) {
    if (!e.target.contains(e.relatedTarget)) {
      e.target.classList.remove("drag-over")
    }
  }

  handleDrop(e) {
    e.preventDefault()
    e.target.classList.remove("drag-over")

    if (!this.draggedTask) return

    const newStatus = e.target.dataset.status
    if (newStatus && newStatus !== this.draggedTask.status) {
      this.moveTask(this.draggedTask.id, newStatus)
      this.addNotification("success", "Task moved successfully", `"${this.draggedTask.title}" moved to ${newStatus}`)
      this.addActivity("task_moved", this.draggedTask, `moved task to ${newStatus}`)
    }
  }

  moveTask(taskId, newStatus) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = newStatus
      task.updatedAt = new Date().toISOString()
      this.renderBoard()
      this.updateStats()
    }
  }

  openTaskModal(status = "todo", editTask = null) {
    const modal = document.getElementById("task-modal")
    const form = document.getElementById("task-form")
    const title = document.getElementById("modal-title")

    if (editTask) {
      title.textContent = "Edit Task"
      this.populateTaskForm(editTask)
    } else {
      title.textContent = "Create New Task"
      form.reset()
      document.getElementById("task-priority").value = "medium"
    }

    // Populate assignee dropdown
    const assigneeSelect = document.getElementById("task-assignee")
    assigneeSelect.innerHTML = this.teamMembers
      .map((member) => `<option value="${member.id}">${member.name}</option>`)
      .join("")

    modal.style.display = "flex"
    document.getElementById("task-title").focus()
  }

  closeTaskModal() {
    document.getElementById("task-modal").style.display = "none"
  }

  populateTaskForm(task) {
    document.getElementById("task-title").value = task.title
    document.getElementById("task-description").value = task.description
    document.getElementById("task-priority").value = task.priority
    document.getElementById("task-assignee").value = task.assignee.id
    document.getElementById("task-due-date").value = task.dueDate
    document.getElementById("task-estimated-hours").value = task.estimatedHours || ""
    document.getElementById("task-tags").value = task.tags.join(", ")
  }

  handleTaskSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const taskData = {
      title: document.getElementById("task-title").value,
      description: document.getElementById("task-description").value,
      priority: document.getElementById("task-priority").value,
      assigneeId: document.getElementById("task-assignee").value,
      dueDate: document.getElementById("task-due-date").value,
      estimatedHours: Number.parseFloat(document.getElementById("task-estimated-hours").value) || 0,
      tags: document
        .getElementById("task-tags")
        .value.split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    const assignee = this.teamMembers.find((m) => m.id === taskData.assigneeId)

    const task = {
      id: Date.now().toString(),
      ...taskData,
      assignee,
      status: "todo",
      comments: [],
      watchers: [this.currentUser.id],
      createdBy: this.currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actualHours: 0,
      isFavorite: false,
      subtasks: [],
    }

    this.tasks.push(task)
    this.renderBoard()
    this.updateStats()
    this.closeTaskModal()

    this.addNotification("success", "Task created", `"${task.title}" has been created successfully`)
    this.addActivity("task_created", task, "created a new task")
  }

  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      this.openTaskModal(task.status, task)
    }
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex > -1) {
        const task = this.tasks[taskIndex]
        this.tasks.splice(taskIndex, 1)
        this.renderBoard()
        this.updateStats()

        this.addNotification("info", "Task deleted", `"${task.title}" has been deleted`)
        this.addActivity("task_deleted", task, "deleted a task")
      }
    }
  }

  toggleFavorite(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.isFavorite = !task.isFavorite
      this.renderBoard()

      const action = task.isFavorite ? "added to" : "removed from"
      this.addNotification("info", "Favorites updated", `"${task.title}" ${action} favorites`)
    }
  }

  openTaskDetail(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (!task) return

    const modal = document.getElementById("task-detail-modal")
    const title = document.getElementById("detail-task-title")
    const content = document.getElementById("task-detail-content")

    title.textContent = task.title

    const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

    content.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <div>
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Description</h4>
                    <p style="color: var(--muted-foreground); line-height: 1.6;">${task.description}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Priority</h4>
                        <div class="task-priority priority-${task.priority}">${task.priority}</div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Status</h4>
                        <div class="badge outline-badge">${task.status}</div>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Assignee</h4>
                    <div class="task-assignee">
                        <div class="avatar">${task.assignee.initials}</div>
                        <span>${task.assignee.name}</span>
                    </div>
                </div>
                
                ${
                  task.dueDate
                    ? `
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Due Date</h4>
                        <div class="task-due-date">
                            <i class="calendar-icon"></i>
                            <span>${this.formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                `
                    : ""
                }
                
                ${
                  task.tags.length > 0
                    ? `
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Tags</h4>
                        <div class="task-tags">
                            ${task.tags.map((tag) => `<span class="task-tag">${tag}</span>`).join("")}
                        </div>
                    </div>
                `
                    : ""
                }
                
                ${
                  totalSubtasks > 0
                    ? `
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Subtasks (${completedSubtasks}/${totalSubtasks})</h4>
                        <div class="progress-bar" style="margin-bottom: 1rem;">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${task.subtasks
                              .map(
                                (subtask) => `
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" ${subtask.completed ? "checked" : ""} 
                                           onchange="taskManager.toggleSubtask('${task.id}', '${subtask.id}')" />
                                    <span style="${subtask.completed ? "text-decoration: line-through; opacity: 0.6;" : ""}">${subtask.title}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div>
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Comments (${task.comments.length})</h4>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.5rem;">
                        ${
                          task.comments.length > 0
                            ? task.comments
                                .map(
                                  (comment) => `
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <div class="avatar" style="width: 1.5rem; height: 1.5rem; font-size: 0.625rem;">
                                    ${comment.author.initials}
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <span style="font-weight: 500; font-size: 0.875rem;">${comment.author.name}</span>
                                        <span style="font-size: 0.75rem; color: var(--muted-foreground);">${this.formatTimeAgo(comment.timestamp)}</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--muted-foreground);">${comment.content}</p>
                                </div>
                            </div>
                        `,
                                )
                                .join("")
                            : '<p style="text-align: center; color: var(--muted-foreground); padding: 2rem;">No comments yet</p>'
                        }
                    </div>
                </div>
            </div>
        `

    modal.style.display = "flex"
  }

  closeTaskDetailModal() {
    document.getElementById("task-detail-modal").style.display = "none"
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task && task.subtasks) {
      const subtask = task.subtasks.find((s) => s.id === subtaskId)
      if (subtask) {
        subtask.completed = !subtask.completed
        task.updatedAt = new Date().toISOString()

        // Refresh the detail modal if it's open
        if (document.getElementById("task-detail-modal").style.display === "flex") {
          this.openTaskDetail(taskId)
        }

        this.renderBoard()
      }
    }
  }

  renderTeamAvatars() {
    const container = document.getElementById("team-avatars")
    const onlineCount = document.getElementById("online-count")

    onlineCount.textContent = this.teamMembers.filter((m) => m.status === "online").length

    container.innerHTML = this.teamMembers
      .slice(0, 4)
      .map(
        (member) => `
            <div class="avatar" title="${member.name} - ${member.productivity}% productivity">
                ${member.initials}
                <div class="status-indicator status-${member.status}"></div>
            </div>
        `,
      )
      .join("")

    if (this.teamMembers.length > 4) {
      container.innerHTML += `
                <div class="avatar" title="${this.teamMembers.length - 4} more members">
                    +${this.teamMembers.length - 4}
                </div>
            `
    }
  }

  updateStats() {
    const totalTasks = this.tasks.length
    document.getElementById("total-tasks").textContent = totalTasks

    // Update column counts
    const statuses = ["todo", "in-progress", "review", "done"]
    statuses.forEach((status) => {
      const count = this.tasks.filter((task) => task.status === status).length
      const countElement = document.querySelector(`[data-status="${status}"] .task-count`)
      if (countElement) {
        countElement.textContent = count
      }
    })
  }

  toggleFilters() {
    const panel = document.getElementById("filters-panel")
    panel.style.display = panel.style.display === "none" ? "block" : "none"
  }

  toggleTeamPanel() {
    const panel = document.getElementById("team-panel")
    const isOpen = panel.classList.contains("open")

    if (isOpen) {
      panel.classList.remove("open")
    } else {
      panel.classList.add("open")
      this.renderTeamPanel()
    }
  }

  renderTeamPanel() {
    const container = document.getElementById("team-members-list")

    container.innerHTML = this.teamMembers
      .map(
        (member) => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border);">
                <div class="avatar">
                    ${member.initials}
                    <div class="status-indicator status-${member.status}"></div>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${member.name}</div>
                    <div style="font-size: 0.875rem; color: var(--muted-foreground);">${member.email}</div>
                    <div style="font-size: 0.75rem; color: var(--muted-foreground);">
                        ${member.status} • ${member.lastSeen}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 500; color: var(--accent);">${member.productivity}%</div>
                    <div style="font-size: 0.75rem; color: var(--muted-foreground);">${member.tasksCompleted} tasks</div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  handleFilterToggle(e) {
    const btn = e.target
    const filterType = btn.dataset.filter
    const value = btn.dataset.value

    if (!this.filters[filterType]) {
      this.filters[filterType] = []
    }

    const index = this.filters[filterType].indexOf(value)
    if (index > -1) {
      this.filters[filterType].splice(index, 1)
      btn.classList.remove("active")
    } else {
      this.filters[filterType].push(value)
      btn.classList.add("active")
    }

    this.renderBoard()
  }

  clearFilters() {
    this.filters = { priority: [], status: [], search: "" }
    document.getElementById("search-input").value = ""
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
    this.renderBoard()
  }

  handleSearch(searchTerm) {
    this.filters.search = searchTerm
    this.renderBoard()
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      document.getElementById("search-input").focus()
    }

    // Ctrl/Cmd + N for new task
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault()
      this.openTaskModal()
    }

    // Escape to close modals
    if (e.key === "Escape") {
      this.closeTaskModal()
      this.closeTaskDetailModal()
    }
  }

  addNotification(type, title, message) {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      isRealTime: true,
    }

    this.notifications.unshift(notification)
    this.renderNotifications()

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id)
    }, 5000)
  }

  renderNotifications() {
    const container = document.getElementById("notifications-container")
    const unreadCount = this.notifications.filter((n) => !n.read).length
    const countBadge = document.getElementById("notification-count")

    if (unreadCount > 0) {
      countBadge.textContent = unreadCount
      countBadge.style.display = "flex"
    } else {
      countBadge.style.display = "none"
    }

    container.innerHTML = this.notifications
      .slice(0, 3)
      .map(
        (notification) => `
            <div class="notification ${notification.type} ${notification.read ? "opacity-75" : ""}" 
                 onclick="taskManager.markNotificationAsRead('${notification.id}')">
                <div style="display: flex; align-items: start; justify-content: space-between;">
                    <div style="flex: 1;">
                        <h4 style="font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem;">${notification.title}</h4>
                        <p style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.5rem;">${notification.message}</p>
                        <p style="font-size: 0.75rem; color: var(--muted-foreground);">${this.formatTimeAgo(notification.timestamp)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        ${notification.isRealTime ? '<div style="width: 0.5rem; height: 0.5rem; background: currentColor; border-radius: 50%; animation: bounce-subtle 2s infinite;"></div>' : ""}
                        ${!notification.read ? '<div style="width: 0.5rem; height: 0.5rem; background: currentColor; border-radius: 50%; animation: bounce-subtle 2s infinite;"></div>' : ""}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.renderNotifications()
    }
  }

  removeNotification(notificationId) {
    const index = this.notifications.findIndex((n) => n.id === notificationId)
    if (index > -1) {
      this.notifications.splice(index, 1)
      this.renderNotifications()
    }
  }

  addActivity(type, task, description) {
    const activity = {
      id: Date.now().toString(),
      type,
      author: this.currentUser,
      taskId: task.id,
      taskTitle: task.title,
      timestamp: new Date().toISOString(),
      description,
    }

    this.activities.unshift(activity)
  }

  updateCursor(e) {
    // Simulate live cursors for demo
    if (Math.random() < 0.01) {
      // 1% chance to update cursor
      const randomUser = this.teamMembers[Math.floor(Math.random() * this.teamMembers.length)]
      this.liveCursors = [
        {
          userId: randomUser.id,
          user: randomUser,
          x: e.clientX + Math.random() * 100 - 50,
          y: e.clientY + Math.random() * 100 - 50,
        },
      ]

      this.renderLiveCursors()

      // Remove cursor after 2 seconds
      setTimeout(() => {
        this.liveCursors = []
        this.renderLiveCursors()
      }, 2000)
    }
  }

  renderLiveCursors() {
    const container = document.getElementById("live-cursors")

    container.innerHTML = this.liveCursors
      .map(
        (cursor) => `
            <div class="live-cursor" style="left: ${cursor.x}px; top: ${cursor.y}px;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="cursor-dot"></div>
                    <div class="cursor-label">${cursor.user.name}</div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  startRealtimeSimulation() {
    // Simulate real-time updates
    setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every 5 seconds
        const actions = ["task_updated", "comment_added", "user_joined"]
        const action = actions[Math.floor(Math.random() * actions.length)]
        const randomTask = this.tasks[Math.floor(Math.random() * this.tasks.length)]
        const randomUser = this.teamMembers[Math.floor(Math.random() * this.teamMembers.length)]

        switch (action) {
          case "task_updated":
            this.addNotification("info", "Task Updated", `${randomUser.name} updated "${randomTask.title}"`)
            break
          case "comment_added":
            this.addNotification("info", "New Comment", `${randomUser.name} commented on "${randomTask.title}"`)
            break
          case "user_joined":
            this.addNotification("success", "User Online", `${randomUser.name} is now online`)
            break
        }

        // Update updates badge
        const updatesBadge = document.getElementById("updates-badge")
        const updatesCount = document.getElementById("updates-count")
        const currentCount = Number.parseInt(updatesCount.textContent) || 0
        updatesCount.textContent = currentCount + 1
        updatesBadge.style.display = "flex"
      }
    }, 5000)

    // Simulate connection status changes
    setInterval(() => {
      if (Math.random() < 0.05) {
        // 5% chance every 10 seconds
        const statuses = ["connected", "connecting", "disconnected"]
        const currentStatus = this.connectionStatus
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)]

        if (newStatus !== currentStatus) {
          this.connectionStatus = newStatus
          this.updateConnectionStatus()

          // Auto-reconnect after disconnect
          if (newStatus === "disconnected") {
            setTimeout(() => {
              this.connectionStatus = "connecting"
              this.updateConnectionStatus()
              setTimeout(() => {
                this.connectionStatus = "connected"
                this.updateConnectionStatus()
              }, 2000)
            }, 3000)
          }
        }
      }
    }, 10000)
  }

  updateConnectionStatus() {
    const statusElement = document.getElementById("connection-status")
    statusElement.className = `connection-status ${this.connectionStatus}`

    const icon = statusElement.querySelector("i")
    const text = statusElement.querySelector("span")

    switch (this.connectionStatus) {
      case "connected":
        icon.setAttribute("class", "wifi-icon")
        text.textContent = "Live"
        break
      case "connecting":
        icon.setAttribute("class", "radio-icon")
        text.textContent = "Connecting..."
        break
      case "disconnected":
        icon.setAttribute("class", "wifi-off-icon")
        text.textContent = "Offline"
        break
    }
  }

  handleOutsideClick(e) {
    // Close modals when clicking outside
    if (e.target.classList.contains("modal")) {
      this.closeTaskModal()
      this.closeTaskDetailModal()
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  formatTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }
}

// Global functions for onclick handlers
function addTask(status) {
  taskManager.openTaskModal(status)
}

// Initialize the application
let taskManager

document.addEventListener("DOMContentLoaded", () => {
  taskManager = new TaskManager()
})
