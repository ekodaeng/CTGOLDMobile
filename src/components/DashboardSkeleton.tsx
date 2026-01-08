import SkeletonBlock from './SkeletonBlock';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <SkeletonBlock width="w-56" height="h-8" rounded="lg" />
          <SkeletonBlock width="w-40" height="h-4" rounded="md" />
        </div>
        <div className="hidden md:block">
          <SkeletonBlock width="w-32" height="h-10" rounded="xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock width="w-24" height="h-4" rounded="md" />
              <SkeletonBlock width="w-10" height="h-10" rounded="lg" />
            </div>
            <SkeletonBlock width="w-32" height="h-10" rounded="lg" />
            <SkeletonBlock width="w-20" height="h-3" rounded="md" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <SkeletonBlock width="w-40" height="h-6" rounded="lg" />
            <SkeletonBlock width="w-24" height="h-8" rounded="lg" />
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-700/30">
              <div className="col-span-1">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
              <div className="col-span-3">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
              <div className="col-span-2">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
              <div className="col-span-2">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
              <div className="col-span-2">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
              <div className="col-span-2">
                <SkeletonBlock width="w-full" height="h-4" rounded="md" />
              </div>
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-4 border-b border-gray-800/30">
                <div className="col-span-1">
                  <SkeletonBlock width="w-full" height="h-4" rounded="md" />
                </div>
                <div className="col-span-3">
                  <SkeletonBlock width="w-full" height="h-4" rounded="md" />
                </div>
                <div className="col-span-2">
                  <SkeletonBlock width="w-16" height="h-5" rounded="full" />
                </div>
                <div className="col-span-2">
                  <SkeletonBlock width="w-full" height="h-4" rounded="md" />
                </div>
                <div className="col-span-2">
                  <SkeletonBlock width="w-full" height="h-4" rounded="md" />
                </div>
                <div className="col-span-2">
                  <SkeletonBlock width="w-12" height="h-4" rounded="md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 space-y-6">
          <SkeletonBlock width="w-40" height="h-6" rounded="lg" />

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <SkeletonBlock width="w-10" height="h-10" rounded="full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock width="w-full" height="h-4" rounded="md" />
                  <SkeletonBlock width="w-3/4" height="h-3" rounded="md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
