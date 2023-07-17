<template>
  <div class="h-full w-full">
    <slot />
    <ClientOnly>
      <Toast v-if="$pwa?.needRefresh">
        <div class="label-1">
          <span> برنامه نیاز به بروزرسانی دارد </span>
        </div>
        <div class="flex flex-row items-center gap-4">
          <Button sm @click="$pwa.updateServiceWorker()" class="flex-1">
            بروز رسانی
          </Button>
          <Button sm outline @click="$pwa.cancelPrompt()" class="flex-1">
            بستن
          </Button>
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
