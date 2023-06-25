<template>
  <div class="h-full w-full">
    <slot />
    <ClientOnly>
      <Toast v-if="$pwa?.offlineReady || $pwa?.needRefresh">
        <div class="label-1">
          <span v-if="$pwa.offlineReady"> برنامه آماده استفاده است </span>
          <span v-else> برنامه نیاز به بروزرسانی دارد </span>
        </div>
        <div class="flex flex-row items-center gap-4">
          <Button
            v-if="$pwa.needRefresh"
            sm
            @click="$pwa.updateServiceWorker()"
          >
            بروز رسانی
          </Button>
          <Button sm outline @click="$pwa.cancelPrompt()"> بستن </Button>
        </div>
      </Toast>
      <Toast
        v-if="
          $pwa?.showInstallPrompt && !$pwa?.offlineReady && !$pwa?.needRefresh
        "
      >
        <div class="label-1">
          <span> نصب برنامه </span>
        </div>
        <div class="flex flex-row items-center gap-4">
          <Button sm @click="$pwa.install()"> نصب </Button>
          <Button sm outline @click="$pwa.cancelInstall()"> پشیمان شدم </Button>
        </div>
      </Toast>
    </ClientOnly>
  </div>
</template>
