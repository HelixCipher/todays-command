import { CommandWidget } from '@/components/CommandWidget';

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-3">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-linux/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sql/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <CommandWidget />
      </div>
    </div>
  );
};

export default Index;
