const Loading = () => {
  return (
    <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-5">
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <div className="absolute h-8 w-8 rounded-full bg-blue-50"></div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-700">
          Loading
          <span className="inline-flex">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Please wait while we get things ready
        </p>
      </div>
    </div>
  );
};

export default Loading;