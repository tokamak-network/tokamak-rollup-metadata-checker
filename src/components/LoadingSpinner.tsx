export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tokamak-blue"></div>
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );
}