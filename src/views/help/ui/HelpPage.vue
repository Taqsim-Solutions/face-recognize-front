<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon, SearchIcon, BookOpenIcon, ShieldIcon, UsersIcon, CameraIcon, BarChartIcon, AlertCircleIcon } from 'lucide-vue-next'
import UserContextBadges from '@/components/UserContextBadges.vue'

const { locale: i18nLocale } = useI18n()
const searchQuery = ref('')
const openItems = ref<Set<number>>(new Set())

const toggle = (id: number) => {
  if (openItems.value.has(id)) openItems.value.delete(id)
  else openItems.value.add(id)
}

const faqCategories = [
  {
    id: 'start',
    icon: BookOpenIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    title: { uz: "Boshlash", uzc: "Бошлаш", ru: "Начало работы", en: "Getting Started" },
    items: [
      {
        id: 1,
        q: { uz: "Tizimga qanday kirish mumkin?", uzc: "Тизимга қандай кириш мумкин?", ru: "Как войти в систему?", en: "How do I log in?" },
        a: { uz: "Kirish sahifasida login va parolingizni kiriting. Parolni unutgan bo'lsangiz, 'Parolni tiklash' tugmasini bosing va emailingizga tasdiqlash kodi yuboriladi.", uzc: "Кириш саҳифасида логин ва паролингизни киритинг. Паролни унутган бўлсангиз, 'Паролни тиклаш' тугмасини босинг.", ru: "На странице входа введите логин и пароль. Если забыли пароль, нажмите 'Восстановить пароль' — код подтверждения придёт на email.", en: "Enter your login and password on the login page. If you forgot your password, click 'Reset Password' and a verification code will be sent to your email." }
      },
      {
        id: 2,
        q: { uz: "Parolim qanday bo'lishi kerak?", uzc: "Паролим қандай бўлиши керак?", ru: "Каким должен быть пароль?", en: "What are the password requirements?" },
        a: { uz: "Parol kamida 8 ta belgidan iborat bo'lishi va quyidagilarni o'z ichiga olishi kerak: kamida 1 ta bosh harf (A-Z), kamida 1 ta kichik harf (a-z), kamida 1 ta raqam (0-9).", uzc: "Парол камида 8 та белгидан иборат бўлиши ва камида 1 та бош ҳарф, 1 та кичик ҳарф ва 1 та рақамни ўз ичига олиши керак.", ru: "Пароль должен содержать не менее 8 символов: минимум 1 заглавную букву (A-Z), 1 строчную букву (a-z) и 1 цифру (0-9).", en: "Password must be at least 8 characters and include: at least 1 uppercase letter (A-Z), 1 lowercase letter (a-z), and 1 number (0-9)." }
      },
      {
        id: 3,
        q: { uz: "Tilni qanday o'zgartirish mumkin?", uzc: "Тилни қандай ўзгартириш мумкин?", ru: "Как изменить язык?", en: "How do I change the language?" },
        a: { uz: "Chap panel pastidagi foydalanuvchi nomiga bosing → 'Til' menyusini tanlang. Mavjud tillar: O'zbek (lotin), Ўзбек (кирилл), Русский, English, Dari, Pashto, Urdu.", uzc: "Чап панел пастидаги фойдаланувчи номига босинг → 'Тил' менюсини танланг.", ru: "Нажмите на имя пользователя в нижней части левой панели → выберите меню 'Язык'. Доступны: Uzbek, Ўзбек, Русский, English, Dari, Pashto, Urdu.", en: "Click on the username at the bottom of the left panel → select 'Language'. Available: Uzbek, Ўзбек, Русский, English, Dari, Pashto, Urdu." }
      }
    ]
  },
  {
    id: 'roles',
    icon: ShieldIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    title: { uz: "Rollar va ruxsatlar", uzc: "Роллар ва рухсатлар", ru: "Роли и доступ", en: "Roles & Permissions" },
    items: [
      {
        id: 4,
        q: { uz: "Qanday rollar mavjud?", uzc: "Қандай роллар мавжуд?", ru: "Какие роли существуют?", en: "What roles are available?" },
        a: { uz: "Tizimda 5 ta rol mavjud:\n• O'qituvchi (Level 1) — faqat o'z sinfi va o'quvchilarini ko'radi\n• Direktor (Level 2) — faqat o'z maktabi, o'qituvchilari va o'quvchilarini ko'radi\n• Tuman (Level 3) — o'z tumani bo'yicha barcha maktablar\n• Viloyat (Level 4) — o'z viloyati bo'yicha barcha ma'lumotlar\n• Admin (Level 5) — barcha ma'lumotlarga to'liq kirish", uzc: "Тизимда 5 та рол мавжуд:\n• Ўқитувчи (Level 1) — фақат ўз синфи\n• Директор (Level 2) — фақат ўз мактаби\n• Туман (Level 3) — тумани бўйича\n• Вилоят (Level 4) — вилояти бўйича\n• Админ (Level 5) — барча маълумотлар", ru: "В системе 5 ролей:\n• Учитель (Level 1) — только свой класс и ученики\n• Директор (Level 2) — только своя школа\n• Район (Level 3) — все школы своего района\n• Область (Level 4) — все данные своей области\n• Администратор (Level 5) — полный доступ ко всем данным", en: "There are 5 roles:\n• Teacher (Level 1) — only their own class and students\n• Director (Level 2) — only their own school\n• District (Level 3) — all schools in their district\n• Region (Level 4) — all data in their region\n• Admin (Level 5) — full access to all data" }
      },
      {
        id: 5,
        q: { uz: "Foydalanuvchi qo'shishda viloyat/tuman/maktab tanlash kerakmi?", uzc: "Фойдаланувчи қўшишда вилоят/туман/мактаб танлаш керакми?", ru: "Нужно ли выбирать регион/район при добавлении пользователя?", en: "Is it required to select region/district when adding a user?" },
        a: { uz: "Rol bo'yicha:\n• Viloyat — viloyat tanlash majburiy\n• Tuman — viloyat va tuman tanlash majburiy\n• Direktor va O'qituvchi — viloyat + tuman majburiy, maktab ixtiyoriy\n• Admin — hech narsa tanlash shart emas", uzc: "Рол бўйича: Вилоят — вилоят мажбурий; Туман — вилоят ва туман мажбурий; Директор/Ўқитувчи — вилоят+туман мажбурий, мактаб ихтиёрий; Админ — ҳеч нарса мажбурий эмас.", ru: "По роли: Область — обязательно выбрать область; Районный — область и район обязательны; Директор/Учитель — область+район обязательны, школа необязательна; Администратор — ничего не обязательно.", en: "By role: Region — region required; District — region + district required; Director/Teacher — region + district required, school optional; Admin — nothing required." }
      }
    ]
  },
  {
    id: 'users',
    icon: UsersIcon,
    color: 'text-green-500',
    bg: 'bg-green-50',
    title: { uz: "O'qituvchilar va O'quvchilar", uzc: "Ўқитувчилар ва Ўқувчилар", ru: "Учителя и Ученики", en: "Teachers & Students" },
    items: [
      {
        id: 6,
        q: { uz: "O'qituvchi qo'shishda Excel dan foydalansa bo'ladimi?", uzc: "Ўқитувчи қўшишда Excel дан фойдаланса бўладими?", ru: "Можно ли добавлять учителей через Excel?", en: "Can I add teachers via Excel?" },
        a: { uz: "Ha! Excel → 'Namuna yuklab olish' tugmasini bosib shablonni oling, to'ldiring va 'Excel fayl yuklash' orqali yuklang. Shuningdek, mavjud o'qituvchilar ro'yxatini 'Ro'yxatni yuklab olish' orqali Excel formatida eksport qilish ham mumkin.", uzc: "Ҳа! Excel → 'Намуна юклаб олиш' орқали шаблон олинг, тўлдиринг ва 'Excel файл юклаш' орқали юкланг. Мавжуд рўйхатни ҳам Excel форматида экспорт қилиш мумкин.", ru: "Да! Нажмите Excel → 'Скачать образец', заполните шаблон и загрузите через 'Загрузить Excel файл'. Также можно экспортировать список в Excel через 'Скачать список'.", en: "Yes! Click Excel → 'Download template', fill it in, and upload via 'Upload Excel file'. You can also export the existing list to Excel via 'Download list'." }
      },
      {
        id: 7,
        q: { uz: "O'quvchiga rasm qo'shish qanday ishlaydi?", uzc: "Ўқувчига расм қўшиш қандай ишлайди?", ru: "Как добавить фото ученику?", en: "How does adding a student photo work?" },
        a: { uz: "O'quvchi qo'shish/tahrirlash formasida 'Fotosuratni yuklang' bo'limida:\n• 'Fayl tanlash' — qurilmangizdan rasm yuklang (JPG/PNG, max 10MB)\n• 'Kamerani ochish' — bevosita kamera orqali suratga oling\nRasm yuz tanib olish tizimi uchun ishlatiladi.", uzc: "Ўқувчи қўшиш/таҳрирлаш формасида: 'Файл танлаш' орқали расм юкланг (JPG/PNG, max 10MB) ёки 'Камерани очиш' орқали бевосита суратга олинг.", ru: "В форме добавления/редактирования ученика: 'Выбрать файл' — загрузить фото (JPG/PNG, max 10МБ) или 'Открыть камеру' — сфотографировать напрямую. Фото используется для системы распознавания лиц.", en: "In the add/edit student form: 'Select File' — upload photo (JPG/PNG, max 10MB) or 'Open Camera' — take a photo directly. The photo is used for face recognition." }
      },
      {
        id: 8,
        q: { uz: "1 ta maktabga faqat 1 ta direktor biriktirilishi mumkinmi?", uzc: "1 та мактабга фақат 1 та директор бириктирилиши мумкинми?", ru: "Может ли у одной школы быть только один директор?", en: "Can a school have only one director?" },
        a: { uz: "Ha, tizim tomonidan avtomatik ta'minlanadi. Yangi direktor tayinlanganda, oldingi direktor avtomatik ravishda o'sha maktabdan olib tashlanadi.", uzc: "Ҳа, тизим томонидан автоматик таъминланади. Янги директор тайинланганда, олдинги директор автоматик равишда ўша мактабдан олиб ташланади.", ru: "Да, это автоматически обеспечивается системой. При назначении нового директора предыдущий автоматически открепляется от этой школы.", en: "Yes, this is automatically enforced by the system. When a new director is assigned, the previous director is automatically removed from that school." }
      }
    ]
  },
  {
    id: 'camera',
    icon: CameraIcon,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    title: { uz: "Kameralar", uzc: "Камералар", ru: "Камеры", en: "Cameras" },
    items: [
      {
        id: 9,
        q: { uz: "Kamera qo'shish uchun nima kerak?", uzc: "Камера қўшиш учун нима керак?", ru: "Что нужно для добавления камеры?", en: "What is needed to add a camera?" },
        a: { uz: "Kamera qo'shish uchun quyidagilar kerak:\n• Kamera nomi\n• Seriya raqami\n• IP manzil\n• Login (Username)\n• Parol (ixtiyoriy)\n• Kamera turi\n• Viloyat, tuman va maktab", uzc: "Камера қўшиш учун: Камера номи, Серия рақами, IP манзил, Логин, Парол (ихтиёрий), Камера тури, Вилоят+туман+мактаб.", ru: "Для добавления камеры нужны: Название камеры, Серийный номер, IP-адрес, Логин, Пароль (необязательно), Тип камеры, Область, район и школа.", en: "To add a camera: Camera name, Serial number, IP address, Login (Username), Password (optional), Camera type, Region, district and school." }
      },
      {
        id: 10,
        q: { uz: "Kamera ma'lumotlarini tahrirlashda nima ko'rinadi?", uzc: "Камера маълумотларини таҳрирлашда нима кўринади?", ru: "Что отображается при редактировании камеры?", en: "What is shown when editing a camera?" },
        a: { uz: "Kamerani tahrirlash panelida quyidagilar avtomatik to'ldiriladi: kamera nomi, seriya raqami, IP manzil, login, kamera turi, o'rnatilgan viloyat, tuman va maktab ma'lumotlari.", uzc: "Камерани таҳрирлаш панелида: камера номи, серия рақами, IP манзил, логин, тури, вилоят, туман ва мактаб маълумотлари автоматик тўлдирилади.", ru: "При редактировании камеры автоматически заполняются: название, серийный номер, IP-адрес, логин, тип, а также регион, район и школа установки.", en: "When editing a camera, the following are auto-filled: name, serial number, IP address, login, type, and the region, district and school of installation." }
      }
    ]
  },
  {
    id: 'attendance',
    icon: BarChartIcon,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    title: { uz: "Davomad va Statistika", uzc: "Давомад ва Статистика", ru: "Посещаемость и Статистика", en: "Attendance & Statistics" },
    items: [
      {
        id: 11,
        q: { uz: "Davomad sahifasida qanday ma'lumotlar ko'rinadi?", uzc: "Давомад саҳифасида қандай маълумотлар кўринади?", ru: "Какие данные отображаются на странице посещаемости?", en: "What data is shown on the attendance page?" },
        a: { uz: "Davomad sahifasida: o'quvchi ismi, maktab, sinf, kelgan vaqti, holati (kelgan/kelmagan). Sana, viloyat, tuman, maktab va sinf bo'yicha filtrlash mumkin.", uzc: "Давомад саҳифасида: ўқувчи исми, мактаб, синф, келган вақти, ҳолати. Сана, вилоят, туман, мактаб ва синф бўйича фильтрлаш мумкин.", ru: "На странице посещаемости: имя ученика, школа, класс, время прихода, статус. Можно фильтровать по дате, региону, району, школе и классу.", en: "Attendance page shows: student name, school, class, arrival time, status (present/absent). You can filter by date, region, district, school and class." }
      },
      {
        id: 12,
        q: { uz: "Statistika sahifasida nima ko'rish mumkin?", uzc: "Статистика саҳифасида нима кўриш мумкин?", ru: "Что можно видеть на странице статистики?", en: "What can be seen on the statistics page?" },
        a: { uz: "Statistika sahifasida: umumiy maktablar soni, ulangan maktablar, o'quvchilar soni, haftalik va oylik davomad grafikları, maktablar bo'yicha batafsil jadval (jami/o'g'il/qiz/kelgan/kelmagan foizlari).", uzc: "Статистика саҳифасида: умумий мактаблар, уланган мактаблар, ўқувчилар сони, ҳафталик/ойлик давомад графиклари, мактаблар бўйича батафсил жадвал.", ru: "На странице статистики: общее кол-во школ, подключённые школы, кол-во учеников, недельные/месячные графики посещаемости, подробная таблица по школам.", en: "Statistics page shows: total schools, connected schools, student count, weekly/monthly attendance charts, detailed table by school (total/boys/girls/present/absent %)." }
      }
    ]
  },
  {
    id: 'errors',
    icon: AlertCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-50',
    title: { uz: "Xatolar va muammolar", uzc: "Хатолар ва муаммолар", ru: "Ошибки и проблемы", en: "Errors & Troubleshooting" },
    items: [
      {
        id: 13,
        q: { uz: "'You do not have permission' xatosi nima?", uzc: "'You do not have permission' хатоси нима?", ru: "Что означает ошибка 'You do not have permission'?", en: "What does 'You do not have permission' error mean?" },
        a: { uz: "Bu xato sizning rolingiz bu amalni bajarishga ruxsat bermasligini bildiradi. Masalan, direktor boshqa maktab ma'lumotlarini o'zgartira olmaydi. Admin bilan bog'laning.", uzc: "Бу хато сизнинг ролингиз бу амalni бажаришга рухсат бермаслигини билдиради. Админ билан боғланинг.", ru: "Эта ошибка означает, что ваша роль не имеет прав на это действие. Например, директор не может изменить данные другой школы. Обратитесь к администратору.", en: "This error means your role does not have permission for this action. For example, a director cannot modify another school's data. Contact your administrator." }
      },
      {
        id: 14,
        q: { uz: "Excel yuklashda xatolik chiqsa nima qilish kerak?", uzc: "Excel юклашда хатолик чиқса нима қилиш керак?", ru: "Что делать при ошибке загрузки Excel?", en: "What to do if Excel upload fails?" },
        a: { uz: "1. Avval 'Namuna yuklab olish' orqali to'g'ri shablonni oling\n2. Faqat belgilangan ustunlarni to'ldiring\n3. Fayl hajmi 10MB dan oshmasin\n4. Faqat .xlsx formatida yuklang\n5. Barcha majburiy maydonlar to'ldirilganligini tekshiring", uzc: "1. 'Намуна юклаб олиш' орқали тўғри шаблон олинг\n2. Фақат белгиланган устунларни тўлдиринг\n3. Файл ҳажми 10MB дан ошмасин\n4. Фақат .xlsx форматида юкланг", ru: "1. Скачайте правильный шаблон через 'Скачать образец'\n2. Заполняйте только указанные столбцы\n3. Размер файла не более 10MB\n4. Загружайте только в формате .xlsx\n5. Убедитесь, что все обязательные поля заполнены", en: "1. Download the correct template via 'Download template'\n2. Fill in only the designated columns\n3. File size must not exceed 10MB\n4. Only upload .xlsx format\n5. Ensure all required fields are filled" }
      }
    ]
  }
]

const locale = ref(localStorage.getItem('language') || 'uz')
// sync with i18n locale changes
watch(i18nLocale, (v) => { locale.value = v })
const getLang = (obj: any): string => {
  return obj?.[locale.value] || obj?.['uz'] || ''
}

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return faqCategories
  const q = searchQuery.value.toLowerCase()
  return faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      getLang(item.q).toLowerCase().includes(q) ||
      getLang(item.a).toLowerCase().includes(q)
    )
  })).filter(cat => cat.items.length > 0)
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <!-- Header -->
    <header class="flex justify-between items-start py-4 pt-0 px-6 border-b border-gray-200 bg-white">
      <div>
        <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
          {{ getLang({ uz: "Yordam markazi", uzc: "Ёрдам маркази", ru: "Центр помощи", en: "Help Center" }) }}
        </h1>
        <UserContextBadges />
      </div>
    </header>

    <div class="px-6 py-6 max-w-4xl mx-auto">
      <!-- Hero search -->
      <div class="bg-gradient-to-br from-[#ff792d] to-[#e05e1a] rounded-2xl p-6 mb-8 text-white">
        <h2 class="text-xl font-bold mb-1">
          {{ getLang({ uz: "Qanday yordam kerak?", uzc: "Қандай ёрдам керак?", ru: "Чем можем помочь?", en: "How can we help?" }) }}
        </h2>
        <p class="text-sm text-orange-100 mb-4">
          {{ getLang({ uz: "Ko'p beriladigan savollarga javoblar", uzc: "Кўп бериладиган саволларга жавоблар", ru: "Ответы на часто задаваемые вопросы", en: "Answers to frequently asked questions" }) }}
        </p>
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-200 w-4 h-4" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="getLang({ uz: 'Savol qidiring...', uzc: 'Савол қидиринг...', ru: 'Поиск вопроса...', en: 'Search questions...' })"
            class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 placeholder-orange-200 text-white border border-white/30 focus:outline-none focus:bg-white/30 text-sm"
          />
        </div>
      </div>

      <!-- FAQ Categories -->
      <div v-if="filteredCategories.length === 0" class="text-center text-gray-400 py-12">
        {{ getLang({ uz: "Hech narsa topilmadi", uzc: "Ҳеч нарса топилмади", ru: "Ничего не найдено", en: "Nothing found" }) }}
      </div>

      <div v-for="cat in filteredCategories" :key="cat.id" class="mb-6">
        <!-- Category header -->
        <div class="flex items-center gap-2 mb-3">
          <div :class="[cat.bg, 'p-2 rounded-lg']">
            <component :is="cat.icon" :class="[cat.color, 'w-4 h-4']" />
          </div>
          <h3 class="font-semibold text-gray-800 text-sm">{{ getLang(cat.title) }}</h3>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-2">
          <div
            v-for="item in cat.items"
            :key="item.id"
            class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow transition-shadow"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer"
              @click="toggle(item.id)"
            >
              <span class="text-sm font-medium text-gray-800 pr-4">{{ getLang(item.q) }}</span>
              <ChevronDownIcon
                class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': openItems.has(item.id) }"
              />
            </button>
            <div
              v-show="openItems.has(item.id)"
              class="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 whitespace-pre-line"
            >
              {{ getLang(item.a) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact footer -->
      <div class="mt-8 bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
        <p class="text-sm text-gray-500">
          {{ getLang({ uz: "Savolingizga javob topa olmadingizmi? Taqsim Solutions jamoasi bilan bog'laning.", uzc: "Саволингизга жавоб топа олмадингизми? Taqsim Solutions жамоаси билан боғланинг.", ru: "Не нашли ответ? Свяжитесь с командой Taqsim Solutions.", en: "Didn't find your answer? Contact the Taqsim Solutions team." }) }}
        </p>
        <a href="mailto:info@taqsim.uz" class="inline-block mt-2 text-sm font-medium text-[#ff792d] hover:underline">
          info@taqsim.uz
        </a>
      </div>
    </div>
  </div>
</template>
