import * as React from "react";
import { PropType, registerComponent } from "@uiflow/cli";
import styled from 'styled-components';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import DroppableContainer from "../../elements/droppable-container";
import { tasks, columns, columnOrder } from "../../constants";
import { IColumn, ITask } from "../../@types";

type DragDropContainerProps = {
  columns: any,
  tasks: any,
  columnOrder: string[]
};

const Container = styled.div`
  display: flex;
`;

const DragDropContainer = ({ columnOrder, columns, tasks }: DragDropContainerProps) => {
  let _columns: any = {};
  columns.forEach((column: IColumn) => {
    _columns[column.id] = column;
  });

  let _tasks: any = {};
  tasks.forEach((task: ITask) => {
    _tasks[task.id] = task;
  });

  const [states, setStates] = React.useState({
    columnOrder,
    columns: _columns,
    tasks: _tasks,
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const start = states.columns[source.droppableId];
    const finish = states.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newStates = {
        ...states,
        columns: {
          ...states.columns,
          [newColumn.id]: newColumn
        },
      };

      setStates(newStates);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newStates = {
      ...states,
      columns: {
        ...states.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    };

    setStates(newStates);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {states.columnOrder.map((columnId, index) => {
          const column: IColumn = states.columns[columnId];
          const items: ITask[] = column.taskIds.map(taskId => states.tasks[taskId]);
          return <DroppableContainer key={index} column={column} items={items} />
        })}
      </Container>
    </DragDropContext>
  );
};

export default registerComponent("drag-drop-container-ufw-component", {
  name: "Drag Drop Container",
  props: [
    {
      type: PropType.AnyArray,
      name: 'columnOrder',
      value: columnOrder,
    },
    {
      type: PropType.AnyArray,
      name: 'columns',
      value: columns,
    },
    {
      type: PropType.AnyArray,
      name: 'tasks',
      value: tasks
    },
  ],
  render({ props }) {
    return (
      <DragDropContainer columnOrder={props.columnOrder} columns={props.columns} tasks={props.tasks} />
    );
  }
});
