import { z } from 'zod';
// --- Tool definitions ---
export const listProjectsTool = {
    name: 'costlocker_list_projects',
    description: 'List projects in Costlocker. Optionally filter by client ID or project state. Returns project names, IDs, clients, states, and budget summaries.',
    inputSchema: {
        type: 'object',
        properties: {
            client_id: { type: 'number', description: 'Filter projects by client ID (optional)' },
            state: { type: 'string', enum: ['running', 'finished', 'idle'], description: 'Filter projects by state (optional)' },
        },
    },
};
export const getProjectTool = {
    name: 'costlocker_get_project',
    description: 'Get detailed information about a specific project including budget, people, and activities.',
    inputSchema: { type: 'object', properties: { project_id: { type: 'number', description: 'The project ID to retrieve' } }, required: ['project_id'] },
};
export const searchProjectsTool = {
    name: 'costlocker_search_projects',
    description: 'Search for projects by name. Returns matching projects with their IDs and basic info.',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Search query to match against project names (case-insensitive)' } }, required: ['query'] },
};
export const createProjectTool = {
    name: 'costlocker_create_project',
    description: '[WRITE OPERATION] Create a new project in Costlocker. This writes to production data. Always confirm project details with the user before calling.',
    annotations: { title: 'Create Project', destructiveHint: true, idempotentHint: false, openWorldHint: true },
    inputSchema: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Project name' },
            client_id: { type: 'number', description: 'Client ID to assign the project to' },
            date_start: { type: 'string', description: 'Project start date (YYYY-MM-DD)' },
            date_end: { type: 'string', description: 'Project end date (YYYY-MM-DD)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tag names to assign to the project' },
            state: { type: 'string', enum: ['running', 'finished', 'idle'], description: 'Project state (default: running)' },
        },
        required: ['name', 'client_id'],
    },
};
export const updateProjectTool = {
    name: 'costlocker_update_project',
    description: '[WRITE OPERATION] Update an existing project (name, dates, state, tags) in Costlocker. This modifies production data. Always confirm changes with the user before calling.',
    annotations: { title: 'Update Project', destructiveHint: true, idempotentHint: true, openWorldHint: true },
    inputSchema: {
        type: 'object',
        properties: {
            project_id: { type: 'number', description: 'The project ID to update' },
            name: { type: 'string', description: 'New project name (optional)' },
            date_start: { type: 'string', description: 'New start date YYYY-MM-DD (optional)' },
            date_end: { type: 'string', description: 'New end date YYYY-MM-DD (optional)' },
            state: { type: 'string', enum: ['running', 'finished', 'idle'], description: 'New project state (optional)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'New tag names (replaces existing tags, optional)' },
        },
        required: ['project_id'],
    },
};
export const upsertTasksTool = {
    name: 'costlocker_upsert_tasks',
    description: '[WRITE OPERATION] Create or update tasks in a project activity, including setting estimated hours (odhadovane hodiny). To create a new task omit task_id. To update an existing task include task_id. All tasks in the array are written in a single API call.',
    annotations: { title: 'Upsert Tasks', destructiveHint: true, idempotentHint: true, openWorldHint: true },
    inputSchema: {
        type: 'object',
        properties: {
            project_id: { type: 'number', description: 'The project ID' },
            activity_id: { type: 'number', description: 'The activity ID under which tasks will be created/updated' },
            person_id: { type: 'number', description: 'The person ID assigned to the tasks' },
            tasks: {
                type: 'array',
                description: 'List of tasks to create or update',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Task name' },
                        budget_hours: { type: 'number', description: 'Estimated hours (odhadovane hodiny) for the task' },
                        task_id: { type: 'number', description: 'Existing task ID for update. Omit to create a new task.' },
                    },
                    required: ['name', 'budget_hours'],
                },
            },
        },
        required: ['project_id', 'activity_id', 'person_id', 'tasks'],
    },
};
export const deleteTaskTool = {
    name: 'costlocker_delete_task',
    description: '[WRITE OPERATION] Delete a task from a project activity.',
    annotations: { title: 'Delete Task', destructiveHint: true, idempotentHint: true, openWorldHint: true },
    inputSchema: {
        type: 'object',
        properties: {
            project_id: { type: 'number', description: 'The project ID' },
            activity_id: { type: 'number', description: 'The activity ID' },
            person_id: { type: 'number', description: 'The person ID' },
            task_id: { type: 'number', description: 'The task ID to delete' },
        },
        required: ['project_id', 'activity_id', 'person_id', 'task_id'],
    },
};
// --- Validation schemas ---
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');
const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    client_id: z.number().int().positive('Client ID must be a positive integer'),
    date_start: dateSchema.optional(),
    date_end: dateSchema.optional(),
    tags: z.array(z.string()).optional(),
    state: z.enum(['running', 'finished', 'idle']).optional(),
});
const updateProjectSchema = z.object({
    project_id: z.number().int().positive('Project ID must be a positive integer'),
    name: z.string().min(1).optional(),
    date_start: dateSchema.optional(),
    date_end: dateSchema.optional(),
    state: z.enum(['running', 'finished', 'idle']).optional(),
    tags: z.array(z.string()).optional(),
});
const upsertTaskSchema = z.object({
    name: z.string().min(1),
    budget_hours: z.number().nonnegative(),
    task_id: z.number().int().positive().optional(),
});
const upsertTasksSchema = z.object({
    project_id: z.number().int().positive(),
    activity_id: z.number().int().positive(),
    person_id: z.number().int().positive(),
    tasks: z.array(upsertTaskSchema).min(1),
});
const deleteTaskSchema = z.object({
    project_id: z.number().int().positive(),
    activity_id: z.number().int().positive(),
    person_id: z.number().int().positive(),
    task_id: z.number().int().positive(),
});
export async function handleListProjects(client, args) {
    try {
        const data = await client.simpleApiSingle('Simple_Projects');
        let projects = Array.isArray(data) ? data : [];
        if (args.client_id) projects = projects.filter(p => p.client?.id === args.client_id);
        if (args.state) projects = projects.filter(p => p.state === args.state);
        const truncated = projects.length > 100;
        const result = truncated ? projects.slice(0, 100) : projects;
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Found ${projects.length} project(s)${truncated ? ' (showing first 100)' : ''}`, projects: result }, null, 2) }] };
    } catch (error) { return errorResult('listing projects', error); }
}
export async function handleGetProject(client, args) {
    try {
        const projectId = args.project_id;
        const data = await client.restGet(`/projects/${projectId}`);
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Project detail for ID ${projectId}`, project: data }, null, 2) }] };
    } catch (error) { return errorResult('getting project', error); }
}
export async function handleSearchProjects(client, args) {
    try {
        const query = args.query.toLowerCase();
        const data = await client.simpleApiSingle('Simple_Projects');
        const projects = Array.isArray(data) ? data : [];
        const matches = projects.filter(p => p.name?.toLowerCase().includes(query));
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Found ${matches.length} project(s) matching "${args.query}"`, projects: matches }, null, 2) }] };
    } catch (error) { return errorResult('searching projects', error); }
}
export async function handleCreateProject(client, args) {
    try {
        const parsed = createProjectSchema.parse(args);
        const project = { name: parsed.name, client_id: parsed.client_id, state: parsed.state || 'running' };
        if (parsed.date_start) project.date_start = parsed.date_start;
        if (parsed.date_end) project.date_end = parsed.date_end;
        if (parsed.tags) project.tags = parsed.tags.map(t => ({ name: t }));
        const data = await client.restPost('/projects/', [project]);
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Project "${parsed.name}" created`, result: data }, null, 2) }] };
    } catch (error) { return errorResult('creating project', error); }
}
export async function handleUpdateProject(client, args) {
    try {
        const parsed = updateProjectSchema.parse(args);
        const project = { id: parsed.project_id };
        if (parsed.name) project.name = parsed.name;
        if (parsed.date_start) project.date_start = parsed.date_start;
        if (parsed.date_end) project.date_end = parsed.date_end;
        if (parsed.state) project.state = parsed.state;
        if (parsed.tags) project.tags = parsed.tags.map(t => ({ name: t }));
        const data = await client.restPost('/projects/', [project]);
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Project ${parsed.project_id} updated`, result: data }, null, 2) }] };
    } catch (error) { return errorResult('updating project', error); }
}
export async function handleUpsertTasks(client, args) {
    try {
        const parsed = upsertTasksSchema.parse(args);
        const items = parsed.tasks.map(t => {
            const item = { type: 'task', activity_id: String(parsed.activity_id), person_id: String(parsed.person_id) };
            if (t.task_id) item.task_id = String(t.task_id);
            return { item, hours: { budget: t.budget_hours }, task: { name: t.name } };
        });
        const data = await client.restPost('/projects/', [{ id: parsed.project_id, items }]);
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Upserted ${parsed.tasks.length} task(s) in project ${parsed.project_id}`, result: data }, null, 2) }] };
    } catch (error) { return errorResult('upserting tasks', error); }
}
export async function handleDeleteTask(client, args) {
    try {
        const parsed = deleteTaskSchema.parse(args);
        const items = [{ item: { type: 'task', activity_id: String(parsed.activity_id), person_id: String(parsed.person_id), task_id: String(parsed.task_id) }, _action: 'delete' }];
        const data = await client.restPost('/projects/', [{ id: parsed.project_id, items }]);
        return { content: [{ type: 'text', text: JSON.stringify({ summary: `Deleted task ${parsed.task_id} from project ${parsed.project_id}`, result: data }, null, 2) }] };
    } catch (error) { return errorResult('deleting task', error); }
}
function errorResult(operation, error) {
    return { content: [{ type: 'text', text: `Error ${operation}: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
}
//# sourceMappingURL=projects.js.map
