'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import ColumnContainer from './ColumnContainer';
import { Board, Task } from '../../types';
import { useStore } from '../../store/useStore';

interface BoardAreaProps {
  board: Board;
  onTaskClick: (task: Task) => void;
  onAddTask: (title: string, columnId: string) => Promise<void>;
  typingStatus: Record<string, string[]>;
}

export default function BoardArea({
  board,
  onTaskClick,
  onAddTask,
  typingStatus,
}: BoardAreaProps) {
  const { updateTaskPositionsOptimistic } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Setup DnD sensors (ignore inputs and textareas to avoid scroll issues)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === 'Task') {
      setActiveTask(e.active.data.current.task);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    // Retrieve active and target structures
    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    const isTask = activeData.type === 'Task';

    if (isTask) {
      const activeTaskObj = activeData.task as Task;
      const sourceColId = activeTaskObj.column;
      let destColId = sourceColId;

      // Over target can be a task card or a column container
      if (overData) {
        if (overData.type === 'Column') {
          destColId = overData.column._id;
        } else if (overData.type === 'Task') {
          destColId = overData.task.column;
        }
      }

      // Find indices
      const sourceCol = board.columns.find((c) => c._id === sourceColId);
      const destCol = board.columns.find((c) => c._id === destColId);

      if (!sourceCol || !destCol) return;

      const sourceIdx = sourceCol.tasks.findIndex((t) => t._id === activeId);
      let destIdx = destCol.tasks.length;

      if (overData && overData.type === 'Task') {
        destIdx = destCol.tasks.findIndex((t) => t._id === overId);
      }

      // Trigger high-performance optimistic reorder mutation immediately!
      updateTaskPositionsOptimistic(
        board._id,
        sourceColId,
        destColId,
        sourceIdx,
        destIdx,
        activeId
      );
    }
  };

  const columnIds = board.columns.map((c) => c._id);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 select-none max-w-full no-scrollbar">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 items-start h-full">
          <SortableContext items={columnIds}>
            {board.columns.map((col) => (
              <ColumnContainer
                key={col._id}
                column={col}
                tasks={col.tasks}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
                typingStatus={typingStatus}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
