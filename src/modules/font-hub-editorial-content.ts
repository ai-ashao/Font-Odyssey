import type { Locale } from '@/i18n/config'
import type { FontHubId } from '@/lib/font-routes'

type EditorialItem = { title: string; body: string }

export type FontHubEditorialContent = {
  heading: string
  introduction: string
  guidance: EditorialItem[]
  faqHeading: string
  faq: EditorialItem[]
}

type EditorialHubId = Extract<
  FontHubId,
  'chinese' | 'sans-serif' | 'free-commercial' | 'variable-fonts'
>

const content: Record<EditorialHubId, Record<Locale, FontHubEditorialContent>> = {
  chinese: {
    en: {
      heading: 'How to choose a Chinese font',
      introduction:
        'Chinese font selection starts with language coverage, not appearance alone. Check whether a family targets Simplified Chinese, Traditional Chinese, or a broader CJK collection, then confirm that its license and available weights fit the intended project.',
      guidance: [
        {
          title: 'Match the regional character set',
          body: 'SC generally targets Simplified Chinese, while TC targets Traditional Chinese. Japanese and Korean CJK families can share many characters but should not be treated as equivalent for Chinese localization.',
        },
        {
          title: 'Expect larger files',
          body: 'A Chinese font must cover thousands of characters, so complete font files are usually much larger than Latin-only fonts. Use only the styles and delivery method your product actually needs.',
        },
        {
          title: 'Verify the license before use',
          body: 'Open licenses can still contain attribution, redistribution, or Reserved Font Name conditions. FontOdyssey shows the reviewed license and upstream source beside every download.',
        },
      ],
      faqHeading: 'Chinese font questions',
      faq: [
        {
          title: 'Can one Chinese font cover every locale?',
          body: 'Not reliably. Character shapes and coverage expectations vary between Simplified Chinese, Traditional Chinese, Hong Kong, Japanese, and Korean typography.',
        },
        {
          title: 'Why is web preview unavailable for some families?',
          body: 'Some licenses contain Reserved Font Name conditions. When a derivative subset would create uncertainty, FontOdyssey keeps the verified original download but does not generate a preview file.',
        },
      ],
    },
    'zh-CN': {
      heading: '如何选择中文字体',
      introduction:
        '选择中文字体时，首先要确认语言覆盖，而不只是比较外观。先判断字体面向简体中文、繁体中文还是更广泛的 CJK 字符集，再核对许可证、字重和文件大小是否适合项目。',
      guidance: [
        {
          title: '匹配地区字符集',
          body: 'SC 通常面向简体中文，TC 通常面向繁体中文。日文和韩文 CJK 字体可能共享大量字符，但不能直接视为中文本地化的等价选择。',
        },
        {
          title: '理解中文字体文件大小',
          body: '完整中文字体需要覆盖数千个字符，因此文件通常远大于仅含拉丁字符的字体。网页项目应只加载实际需要的字重和交付格式。',
        },
        {
          title: '使用前核对许可证',
          body: '开源许可证仍可能包含署名、再分发或 Reserved Font Name 条件。FontOdyssey 在每个下载入口旁展示审核过的许可证和上游来源。',
        },
      ],
      faqHeading: '中文字体常见问题',
      faq: [
        {
          title: '一个中文字体能覆盖所有地区吗？',
          body: '通常不能。简体中文、繁体中文、香港字形以及日文、韩文排版在字形和覆盖要求上都可能不同。',
        },
        {
          title: '为什么部分字体没有网页预览？',
          body: '部分许可证包含 Reserved Font Name 条件。当生成衍生子集存在不确定性时，FontOdyssey 会保留已验证的原始下载，但不生成预览文件。',
        },
      ],
    },
    'zh-TW': {
      heading: '如何選擇中文字體',
      introduction:
        '選擇中文字體時，首先要確認語言涵蓋，而不只是比較外觀。先判斷字體面向簡體中文、繁體中文或更廣泛的 CJK 字元集，再核對授權、字重與檔案大小是否適合專案。',
      guidance: [
        {
          title: '配合地區字元集',
          body: 'SC 通常面向簡體中文，TC 通常面向繁體中文。日文與韓文 CJK 字體可能共享大量字元，但不能直接視為中文在地化的等價選擇。',
        },
        {
          title: '理解中文字體檔案大小',
          body: '完整中文字體需要涵蓋數千個字元，因此檔案通常遠大於只含拉丁字元的字體。網頁專案應只載入實際需要的字重與交付格式。',
        },
        {
          title: '使用前核對授權',
          body: '開源授權仍可能包含署名、再散布或 Reserved Font Name 條件。FontOdyssey 在每個下載入口旁顯示審核過的授權與上游來源。',
        },
      ],
      faqHeading: '中文字體常見問題',
      faq: [
        {
          title: '一個中文字體能涵蓋所有地區嗎？',
          body: '通常不能。簡體中文、繁體中文、香港字形以及日文、韓文排版在字形與涵蓋要求上都可能不同。',
        },
        {
          title: '為什麼部分字體沒有網頁預覽？',
          body: '部分授權包含 Reserved Font Name 條件。當產生衍生子集存在不確定性時，FontOdyssey 會保留已驗證的原始下載，但不產生預覽檔案。',
        },
      ],
    },
  },
  'sans-serif': {
    en: {
      heading: 'Choosing a sans serif family',
      introduction:
        'Sans serif fonts cover everything from compact product interfaces to large editorial headlines. The most useful choice is not always the family with the most styles; it is the one whose proportions, weights, language coverage, and license match the real layout.',
      guidance: [
        {
          title: 'Start with the reading environment',
          body: 'For interfaces and dense documentation, test small sizes, numerals, punctuation, and distinguishable letterforms. Display work can tolerate more personality and tighter spacing.',
        },
        {
          title: 'Choose only the weights you need',
          body: 'A large static family can add unnecessary requests. Variable fonts may consolidate a range of weights, but the resulting file and browser strategy should still be measured.',
        },
        {
          title: 'Check language coverage early',
          body: 'A clean Latin specimen does not prove support for Vietnamese, Cyrillic, Greek, or CJK text. Use the measured coverage and source facts on each FontOdyssey detail page.',
        },
      ],
      faqHeading: 'Sans serif questions',
      faq: [
        {
          title: 'Are sans serif fonts always better for screens?',
          body: 'No. Screen readability depends on size, spacing, contrast, rendering, and the specific family. Test the font in the actual interface rather than relying on its category.',
        },
        {
          title: 'Should a design system use a variable font?',
          body: 'It can be useful when many weights or optical sizes are needed. A small site using only two weights may be better served by two static files.',
        },
      ],
    },
    'zh-CN': {
      heading: '如何选择无衬线字体',
      introduction:
        '无衬线字体既可用于紧凑的产品界面，也可用于大型编辑标题。最合适的选择不一定拥有最多样式，而应在字面比例、字重、语言覆盖和许可证方面适合真实版面。',
      guidance: [
        {
          title: '从阅读环境出发',
          body: '界面和密集文档应测试小字号、数字、标点和容易混淆的字形。展示设计可以容纳更强的个性和更紧凑的间距。',
        },
        {
          title: '只选择需要的字重',
          body: '大型静态字体家族可能增加不必要的请求。可变字体能合并多个字重范围，但仍应实际测量文件大小和浏览器加载方案。',
        },
        {
          title: '尽早检查语言覆盖',
          body: '拉丁预览显示正常，不代表一定支持越南文、西里尔文、希腊文或 CJK。请查看每个详情页记录的字符覆盖和来源事实。',
        },
      ],
      faqHeading: '无衬线字体常见问题',
      faq: [
        {
          title: '无衬线字体一定更适合屏幕吗？',
          body: '不一定。屏幕可读性还取决于字号、间距、对比度、渲染方式和具体字体，应在真实界面中测试。',
        },
        {
          title: '设计系统应该使用可变字体吗？',
          body: '需要大量字重或光学尺寸时很有价值；只使用两个字重的小型网站，两个静态文件可能更简单。',
        },
      ],
    },
    'zh-TW': {
      heading: '如何選擇無襯線字體',
      introduction:
        '無襯線字體既可用於緊湊的產品介面，也可用於大型編輯標題。最合適的選擇不一定擁有最多樣式，而應在字面比例、字重、語言涵蓋與授權方面適合真實版面。',
      guidance: [
        {
          title: '從閱讀環境出發',
          body: '介面與密集文件應測試小字級、數字、標點與容易混淆的字形。展示設計可以容納更強的個性與更緊湊的間距。',
        },
        {
          title: '只選擇需要的字重',
          body: '大型靜態字體家族可能增加不必要的請求。可變字體能合併多個字重範圍，但仍應實際測量檔案大小與瀏覽器載入方案。',
        },
        {
          title: '及早檢查語言涵蓋',
          body: '拉丁預覽顯示正常，不代表一定支援越南文、西里爾文、希臘文或 CJK。請查看每個詳情頁記錄的字元涵蓋與來源事實。',
        },
      ],
      faqHeading: '無襯線字體常見問題',
      faq: [
        {
          title: '無襯線字體一定更適合螢幕嗎？',
          body: '不一定。螢幕可讀性還取決於字級、間距、對比度、渲染方式與具體字體，應在真實介面中測試。',
        },
        {
          title: '設計系統應該使用可變字體嗎？',
          body: '需要大量字重或光學尺寸時很有價值；只使用兩個字重的小型網站，兩個靜態檔案可能更簡單。',
        },
      ],
    },
  },
  'free-commercial': {
    en: {
      heading: 'Using open-license fonts in commercial work',
      introduction:
        'This collection contains families that passed FontOdyssey’s current redistribution gate. “Free for commercial use” does not mean every license is identical, so the font-specific license remains part of the download decision.',
      guidance: [
        {
          title: 'Read the included license',
          body: 'Review the license file distributed with the font, especially when packaging fonts with software, client deliverables, templates, or editable source files.',
        },
        {
          title: 'Separate use from modification',
          body: 'Using a font in artwork is different from modifying the font software or redistributing a derivative. Reserved Font Name and attribution conditions matter most in those derivative workflows.',
        },
        {
          title: 'Keep release evidence',
          body: 'Record the family, version, source, and license used for a project. FontOdyssey exposes a versioned archive, license copy, official source, and integrity metadata for each release.',
        },
      ],
      faqHeading: 'Commercial-use questions',
      faq: [
        {
          title: 'Does FontOdyssey provide legal advice?',
          body: 'No. The catalog presents reviewed source and license facts to support a decision, but project-specific legal obligations remain with the user.',
        },
        {
          title: 'Can I redistribute the downloaded ZIP?',
          body: 'Check the included license first. Permission to use a font in a design does not automatically answer every redistribution or modification scenario.',
        },
      ],
    },
    'zh-CN': {
      heading: '在商业项目中使用开源字体',
      introduction:
        '本合集包含已通过 FontOdyssey 当前再分发门禁的字体家族。“免费商用”并不代表所有许可证完全相同，具体字体的许可证仍是下载决策的一部分。',
      guidance: [
        {
          title: '阅读随包许可证',
          body: '使用前查看下载包内的许可证，尤其是在软件、客户交付物、模板或可编辑源文件中一并分发字体时。',
        },
        {
          title: '区分使用、修改和再分发',
          body: '在作品中使用字体，不等同于修改字体软件或分发衍生版本。Reserved Font Name 和署名条件在衍生流程中尤其重要。',
        },
        {
          title: '保存发布依据',
          body: '建议记录项目使用的字体家族、版本、来源和许可证。FontOdyssey 为每个版本展示带版本的下载包、许可证副本、官方来源和完整性数据。',
        },
      ],
      faqHeading: '免费商用字体常见问题',
      faq: [
        {
          title: 'FontOdyssey 提供法律意见吗？',
          body: '不提供。本站展示经过审核的来源和许可证事实，帮助用户判断；具体项目的法律义务仍由使用者自行确认。',
        },
        {
          title: '可以再次分发下载的 ZIP 吗？',
          body: '请先查看随包许可证。允许在设计中使用字体，并不自动涵盖所有再分发或修改场景。',
        },
      ],
    },
    'zh-TW': {
      heading: '在商業專案中使用開源字體',
      introduction:
        '本合集包含已通過 FontOdyssey 目前再散布門檻的字體家族。「免費商用」並不代表所有授權完全相同，具體字體的授權仍是下載決策的一部分。',
      guidance: [
        {
          title: '閱讀隨包授權',
          body: '使用前查看下載包內的授權文件，尤其是在軟體、客戶交付物、範本或可編輯原始檔中一併散布字體時。',
        },
        {
          title: '區分使用、修改與再散布',
          body: '在作品中使用字體，不等同於修改字體軟體或散布衍生版本。Reserved Font Name 與署名條件在衍生流程中尤其重要。',
        },
        {
          title: '保留發布依據',
          body: '建議記錄專案使用的字體家族、版本、來源與授權。FontOdyssey 為每個版本顯示帶版本的下載包、授權副本、官方來源與完整性資料。',
        },
      ],
      faqHeading: '免費商用字體常見問題',
      faq: [
        {
          title: 'FontOdyssey 提供法律意見嗎？',
          body: '不提供。本站顯示經過審核的來源與授權事實，協助使用者判斷；具體專案的法律義務仍由使用者自行確認。',
        },
        {
          title: '可以再次散布下載的 ZIP 嗎？',
          body: '請先查看隨包授權。允許在設計中使用字體，並不自動涵蓋所有再散布或修改情境。',
        },
      ],
    },
  },
  'variable-fonts': {
    en: {
      heading: 'Working with variable fonts',
      introduction:
        'A variable font stores one or more adjustable design axes in a single font resource. Common axes include weight (wght), width (wdth), and optical size (opsz), but every family exposes its own supported range.',
      guidance: [
        {
          title: 'Inspect the available axes',
          body: 'Do not assume every variable font supports width or optical size. FontOdyssey lists the axes measured in the approved release so you can compare families before downloading.',
        },
        {
          title: 'Compare variable and static delivery',
          body: 'One variable file can replace several static weights, but it is not automatically smaller than the exact subset of static files a project needs. Measure the real payload.',
        },
        {
          title: 'Define intentional instances',
          body: 'For a design system, name the weight, width, or optical-size combinations that components may use. This keeps flexible axes from producing inconsistent typography.',
        },
      ],
      faqHeading: 'Variable font questions',
      faq: [
        {
          title: 'What do wght, wdth, and opsz mean?',
          body: 'They represent weight, width, and optical size. Axis ranges differ by family, and some fonts expose additional registered or custom axes.',
        },
        {
          title: 'Are variable fonts always faster?',
          body: 'No. They are efficient when many instances are required, but a project using very few styles should compare actual transferred bytes and caching behavior.',
        },
      ],
    },
    'zh-CN': {
      heading: '如何使用可变字体',
      introduction:
        '可变字体把一个或多个可调设计轴存放在同一个字体资源中。常见轴包括字重（wght）、宽度（wdth）和光学尺寸（opsz），但每个字体家族支持的范围不同。',
      guidance: [
        {
          title: '查看实际可用轴',
          body: '不要假定所有可变字体都支持宽度或光学尺寸。FontOdyssey 展示审核版本中测得的轴，方便下载前比较。',
        },
        {
          title: '比较可变与静态交付',
          body: '一个可变文件可以替代多个静态字重，但不一定小于项目真正需要的少量静态文件，应以实际传输体积为准。',
        },
        {
          title: '定义明确的设计实例',
          body: '设计系统应规定组件可使用的字重、宽度或光学尺寸组合，避免灵活的轴产生不一致的排版。',
        },
      ],
      faqHeading: '可变字体常见问题',
      faq: [
        {
          title: 'wght、wdth 和 opsz 分别是什么？',
          body: '它们分别表示字重、宽度和光学尺寸。不同字体的轴范围不同，也可能包含其他注册轴或自定义轴。',
        },
        {
          title: '可变字体一定加载更快吗？',
          body: '不一定。需要大量实例时通常更高效；只使用少量样式的项目应比较真实传输字节和缓存方式。',
        },
      ],
    },
    'zh-TW': {
      heading: '如何使用可變字體',
      introduction:
        '可變字體把一個或多個可調設計軸存放在同一個字體資源中。常見軸包括字重（wght）、寬度（wdth）與光學尺寸（opsz），但每個字體家族支援的範圍不同。',
      guidance: [
        {
          title: '查看實際可用軸',
          body: '不要假定所有可變字體都支援寬度或光學尺寸。FontOdyssey 顯示審核版本中測得的軸，方便下載前比較。',
        },
        {
          title: '比較可變與靜態交付',
          body: '一個可變檔案可以取代多個靜態字重，但不一定小於專案真正需要的少量靜態檔案，應以實際傳輸體積為準。',
        },
        {
          title: '定義明確的設計實例',
          body: '設計系統應規定元件可使用的字重、寬度或光學尺寸組合，避免彈性的軸產生不一致的排版。',
        },
      ],
      faqHeading: '可變字體常見問題',
      faq: [
        {
          title: 'wght、wdth 與 opsz 分別是什麼？',
          body: '它們分別代表字重、寬度與光學尺寸。不同字體的軸範圍不同，也可能包含其他註冊軸或自訂軸。',
        },
        {
          title: '可變字體一定載入更快嗎？',
          body: '不一定。需要大量實例時通常更有效率；只使用少量樣式的專案應比較真實傳輸位元組與快取方式。',
        },
      ],
    },
  },
}

export function fontHubEditorialContent(
  hubId: FontHubId,
  locale: Locale,
): FontHubEditorialContent | undefined {
  if (!(hubId in content)) return undefined
  return content[hubId as EditorialHubId][locale]
}
