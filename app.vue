<template>
  <Html lang="fa-IR" dir="rtl" class="h-full w-full bg-slate-500">
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
      <title>شمس</title>
    </Head>
    <Body dir="rtl" class="max-w-md m-auto h-full w-full">
      <VitePwaManifest />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
