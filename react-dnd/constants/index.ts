export const tasks = [
    {
        id: 'task1',
        text: 'Open AI Component',
    },
    {
        id: 'task2',
        text: 'Speech Recognition Component',
    },
    {
        id: 'task3',
        text: 'Stable Diffusion Client',
    },
    {
        id: 'task4',
        text: 'Drag & Drop',
    }
];

export const columns = [
    {
        id: 'column1',
        title: 'To Do',
        taskIds: ['task1', 'task2', 'task3', 'task4']
    },
    {
        id: 'column2',
        title: 'In Progress',
        taskIds: []
    },
    {
        id: 'column3',
        title: 'Done',
        taskIds: []
    }
];

export const columnOrder = ['column1', 'column2', 'column3'];
