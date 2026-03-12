<script setup lang="ts">
definePageMeta({ title: 'Settings' })
useHead({ title: 'Settings – Pre Booking' })

const { t } = useI18n()
</script>

<template>
  <div class="space-y-10">
    <ExcelUploadSection
      :title="t('settings.quota.title')"
      :description="t('settings.quota.description')"
      :filename-placeholder="t('settings.quota.filenamePlaceholder')"
      upload-api-path="/api/import/quota"
      :toast-upload-success="t('toast.settings.quotaUploadSuccess')"
      :toast-exporting="t('toast.settings.quotaExporting')"
      :toast-invalid-file="t('toast.settings.invalidFileType')"
      :toast-upload-failed="t('toast.settings.uploadFailed')"
    />

    <ExcelUploadSection
      :title="t('settings.pickupDate.title')"
      :description="t('settings.pickupDate.description')"
      :filename-placeholder="t('settings.pickupDate.filenamePlaceholder')"
      upload-api-path="/api/import/dates"
      :toast-upload-success="t('toast.settings.pickupDateUploadSuccess')"
      :toast-exporting="t('toast.settings.pickupDateExporting')"
      :toast-invalid-file="t('toast.settings.invalidFileType')"
      :toast-upload-failed="t('toast.settings.uploadFailed')"
    />
  </div>
</template>
