import React from 'react';
import { FloorPlan2D } from '../components/canvas/FloorPlan2D';
import { RoomScene3D } from '../components/canvas/RoomScene3D';
import { StudioSidebar } from '../components/studio/StudioSidebar';
import { StudioToolbar } from '../components/studio/StudioToolbar';
import { WardrobeConfiguratorModal } from '../components/studio/WardrobeConfiguratorModal';
import { useRoomStore } from '../store/useRoomStore';

export const StudioPage: React.FC = () => {
  const viewMode = useRoomStore((s) => s.viewMode);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-zinc-950 overflow-hidden">
      <StudioToolbar />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden relative">
          {(viewMode === '3d' || viewMode === 'first-person') && (
            <div className="w-full h-full relative overflow-hidden">
              <RoomScene3D />
            </div>
          )}

          {viewMode === '2d' && (
            <div className="w-full h-full relative overflow-hidden">
              <FloorPlan2D />
            </div>
          )}

          {viewMode === 'split' && (
            <div className="w-full h-full flex overflow-hidden">
              <div className="w-1/2 h-full border-r border-zinc-800 relative overflow-hidden">
                <RoomScene3D />
              </div>
              <div className="w-1/2 h-full relative overflow-hidden">
                <FloorPlan2D />
              </div>
            </div>
          )}
        </div>

        <StudioSidebar />
      </div>

      <WardrobeConfiguratorModal />
    </div>
  );
};

export default StudioPage;
