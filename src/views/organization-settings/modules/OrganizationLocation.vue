<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L, { LeafletMouseEvent, LatLngExpression, LatLng } from 'leaflet'
import { useGetOrganizationOptions } from '../query/useGetOrganizationOptions'
import { updateOrganizationOptions } from '../api'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const { data: optionsData } = useGetOrganizationOptions()

const zoom = ref(12)
const center = ref<any>([41.3111, 69.2797])
const selectedLocation: Ref<LatLng | LatLngExpression | null> = ref(null)
const isSaving = ref(false)

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

const emit = defineEmits<{
  (e: 'locationSelected', location: { lat: number; lng: number }): void
}>()

function onMapClick(e: LeafletMouseEvent) {
  selectedLocation.value = e.latlng
}

async function emitSave() {
  if (selectedLocation.value && optionsData.value?.data?.data) {
    const latlng = L.latLng(selectedLocation.value as LatLngExpression)
    const { lat, lng } = latlng
    const currentData = optionsData.value.data.data

    const payload = {
      ...currentData,
      latitude: lat,
      longitude: lng
    }

    try {
      isSaving.value = true
      await updateOrganizationOptions(payload)
      toast.success(t('success.settings-updated'))
      emit('locationSelected', { lat, lng })
    } catch (error) {
      console.error('Failed to update location:', error)
      toast.error(t('error-occurred'))
    } finally {
      isSaving.value = false
    }
  }
}

watch(
  () => optionsData.value,
  (data) => {
    if (data?.data.data?.latitude && data?.data.data?.longitude) {
      const latlng: [number, number] = [data.data.data.latitude, data.data.data.longitude]
      center.value = latlng
      selectedLocation.value = latlng
    }
  },
  { immediate: true }
)

onMounted(() => {
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
  })
})
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-4 mb-5 bg-gray-50">
      <CardTitle class="text-lg font-semibold -mb-1">{{ t('location') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('location_description') }}</p>
    </CardHeader>
    <CardContent>
      <div class="w-full">
        <div class="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200">
          <l-map
            v-model:zoom="zoom"
            :center="center"
            :options="{ dragging: !isSaving, scrollWheelZoom: !isSaving }"
            style="height: 100%; width: 100%"
            @click="onMapClick"
          >
            <l-tile-layer :url="tileUrl" :attribution="tileAttribution" />
            <l-marker :lat-lng="selectedLocation" v-if="selectedLocation" />
          </l-map>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            v-if="!!selectedLocation"
            @click="emitSave"
            :disabled="isSaving"
            :aria-label="t('save')"
            class="inline-flex items-center text-sm gap-2 px-6 py-2.5 bg-[#29A679] text-white rounded-lg hover:bg-[#12B76A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isSaving"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            {{ t('save') }}
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
