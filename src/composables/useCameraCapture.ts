import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

/**
 * Reusable photo + camera capture logic.
 * Used by student/teacher create & edit drawers.
 *
 * Handles:
 *  - File select / drag & drop
 *  - Image compression (max 800px, JPEG)
 *  - Live camera capture (front/rear) with mirror handling
 *  - Cleanup of object URLs and media streams
 */
export function useCameraCapture(options?: { mirrorFront?: boolean }) {
  const { t } = useI18n()
  const mirrorFront = options?.mirrorFront ?? true

  // ── Photo state ───────────────────────────────────────────────
  const photoFile = ref<File | null>(null)
  const photoPreviewUrl = ref<string | null>(null)
  const isDragging = ref(false)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // ── Camera state ──────────────────────────────────────────────
  const isCameraOpen = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const cameraError = ref<string | null>(null)

  // ── Image compression ─────────────────────────────────────────
  const compressImage = (file: File, maxSize = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          } else {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            else resolve(file)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(file)
      }
      img.src = url
    })
  }

  // ── File select / drag & drop ─────────────────────────────────
  const setPreview = (file: File) => {
    if (photoPreviewUrl.value && !photoPreviewUrl.value.startsWith('/api')) {
      URL.revokeObjectURL(photoPreviewUrl.value)
    }
    photoFile.value = file
    photoPreviewUrl.value = URL.createObjectURL(file)
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('validation.only-images-allowed', 'Faqat rasm fayllari qabul qilinadi'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('validation.image-size-limit-10mb', 'Rasm hajmi 10MB dan oshmasligi kerak'))
      return
    }
    compressImage(file).then(setPreview)
  }

  const triggerFileInput = () => fileInputRef.value?.click()

  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) processFile(file)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = true
  }
  const onDragLeave = () => {
    isDragging.value = false
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
  }

  const removePhoto = () => {
    if (photoPreviewUrl.value && !photoPreviewUrl.value.startsWith('/api')) {
      URL.revokeObjectURL(photoPreviewUrl.value)
    }
    photoFile.value = null
    photoPreviewUrl.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  // ── Live camera ───────────────────────────────────────────────
  const openCamera = async () => {
    isCameraOpen.value = true
    cameraError.value = null
    await nextTick()
    try {
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
      }
      mediaStream.value = stream
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        videoRef.value.setAttribute('playsinline', 'true')
        videoRef.value.setAttribute('autoplay', 'true')
        try {
          await videoRef.value.play()
        } catch {
          /* autoplay blocked — user will tap */
        }
      }
    } catch (err) {
      console.error('Kameraga kirishda xatolik:', err)
      cameraError.value = t(
        'camera.failed-to-start',
        "Kamerani ishga tushirib bo'lmadi. Kameraga ruxsat berilganini tekshiring."
      )
    }
  }

  const closeCamera = () => {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop())
      mediaStream.value = null
    }
    isCameraOpen.value = false
  }

  const capturePhoto = () => {
    if (!videoRef.value) return
    const video = videoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror only the front camera (so the saved image isn't reversed text/face)
    const tracks = mediaStream.value?.getVideoTracks() || []
    const settings = tracks[0]?.getSettings?.() || {}
    const isFront = (settings as any).facingMode === 'user'
    if (mirrorFront && isFront) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const rawFile = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
        compressImage(rawFile).then((compressed) => {
          setPreview(compressed)
          closeCamera()
        })
      },
      'image/jpeg',
      0.9
    )
  }

  // Auto-stop camera when modal closes
  watch(isCameraOpen, (val) => {
    if (!val) closeCamera()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    closeCamera()
    if (photoPreviewUrl.value && !photoPreviewUrl.value.startsWith('/api')) {
      URL.revokeObjectURL(photoPreviewUrl.value)
    }
  })

  return {
    // photo
    photoFile,
    photoPreviewUrl,
    isDragging,
    fileInputRef,
    triggerFileInput,
    handleFileSelect,
    processFile,
    removePhoto,
    setPreview,
    onDragOver,
    onDragLeave,
    onDrop,
    compressImage,
    // camera
    isCameraOpen,
    videoRef,
    mediaStream,
    cameraError,
    openCamera,
    closeCamera,
    capturePhoto
  }
}
