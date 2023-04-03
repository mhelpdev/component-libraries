import * as React from 'react';
import styled from 'styled-components';
import { DroppableProvided, Droppable, DroppableStateSnapshot } from 'react-beautiful-dnd';
import DraggableItem from '../draggable-item';
import { IColumn, ITask } from '../../@types';

type DroppableContainerProps = {
  column: IColumn,
  items: ITask[],
};

type ContainerProps = {
  isDraggingOver: boolean
};

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;

  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  padding: 8px;
`;

const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${(props: ContainerProps) => (props.isDraggingOver ? 'skyblue' : 'white')};
  flex-grow: 1;
  min-height: 100px;
`;

const DroppableContainer = ({ column, items }: DroppableContainerProps) => {
  return (
    <Container>
      <Title>{column.title}</Title>
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <TaskList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {items.map((item, index) => (
              <DraggableItem key={item.id} index={index} item={item} />
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </Container>
  );
};

export default DroppableContainer;
