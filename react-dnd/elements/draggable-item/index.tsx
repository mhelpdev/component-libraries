import * as React from 'react';
import styled from 'styled-components';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { ITask } from '../../@types';

type DraggableItemProps = {
  index: number,
  item: ITask,
};

type ContainerProps = {
  isDragging: boolean
};

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${(props: ContainerProps) => (props.isDragging ? 'lightgreen' : 'white')};
  display: flex;
`;

const Handle = styled.div`
  width: 20px;
  height: 20px;
  background-color: orange;
  border-radius: 4px;
  margin-right: 8px;
`;

const DraggableItem = ({ index, item }: DraggableItemProps) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
        >
          <Handle {...provided.dragHandleProps} />
          {item.text}
        </Container>
      )}
    </Draggable>
  );
};

export default DraggableItem;
