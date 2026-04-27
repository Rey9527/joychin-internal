// lang-en.js — JOY CHIN PSA English Translation Layer
// Uses DOM text replacement via MutationObserver.
// Does not modify index.html logic. Add/remove strings here to expand coverage.

(function(){
  const STORAGE_KEY='joychin_lang'
  let currentLang=localStorage.getItem(STORAGE_KEY)||'zh'

  // ── Translation map: Chinese → English ───────────────────────────────────
  const DICT={
    // Sidebar sections
    '業務':'Business',
    '通訊錄':'Contacts',
    '產品':'Products',
    '離型紙業務系統':'Release Liner System',
    '未登入':'Not logged in',

    // Nav items
    '詢價管理':'Inquiries',
    '報價管理':'Quotations',
    '樣品管理':'Samples',
    '工作追蹤':'Tasks',
    '訂單管理':'Orders',
    '船運管理':'Shipments',
    '採購單管理':'Purchase Orders',
    '客戶管理':'Customers',
    '供應商管理':'Suppliers',
    '使用者管理':'Users',
    '系統設定':'Settings',
    '產品目錄':'Product Catalog',
    '技術文件庫':'Document Library',

    // Topbar / common buttons
    '登出':'Logout',
    '登入':'Login',
    '篩選條件':'Filter',
    '清除':'Clear',
    '套用':'Apply',
    '取消':'Cancel',
    '儲存':'Save',
    '新增':'Add',
    '刪除':'Delete',
    '編輯':'Edit',
    '關閉':'Close',
    '確認':'Confirm',
    '返回':'Back',
    '搜尋':'Search',
    '全部':'All',
    '備註':'Notes',
    '狀態':'Status',
    '日期':'Date',

    // Filter options — Inquiry
    '全部狀態':'All Statuses',
    '全部客戶':'All Customers',
    '全部供應商':'All Suppliers',
    '全部優先級':'All Priorities',
    '全部方式':'All Modes',
    '待詢供應商':'Pending',
    '已發詢價':'Sent to Supplier',
    '供應商已回':'Supplier Replied',
    '已送報價':'Sent to Quote',
    '已結案':'Closed',

    // Filter options — Quotes
    '草稿':'Draft',
    '已送客戶':'Sent to Customer',
    '客戶接受':'Accepted',
    '客戶拒絕':'Rejected',

    // Filter options — Samples
    '庫存中':'In Stock',
    '等待到貨':'Awaiting Arrival',
    '等待回饋':'Awaiting Feedback',
    '無庫存':'No Stock',

    // Filter options — Tasks
    '進行中':'In Progress',
    '已完成':'Completed',
    '緊急':'Urgent',
    '高':'High',
    '一般':'Normal',

    // Filter options — Orders
    '已確認':'Confirmed',
    '生產中':'In Production',
    '已出貨':'Shipped',
    '已到貨':'Delivered',
    '已完成':'Completed',
    '已取消':'Cancelled',

    // Filter options — Shipments
    '已規劃':'Planned',
    '已訂艙':'Booked',
    '運送中':'In Transit',
    '已到港':'Arrived',

    // Filter options — Purchase Orders
    '待確認':'Pending',

    // Shipment modes
    '海運':'Sea',
    '空運':'Air',
    '陸運':'Land',
    '快遞':'Express',

    // Common action buttons (HTML static)
    '+ 新增詢價':'+ New Inquiry',
    '+ 新增工作':'+ New Task',
    '+ 新增訂單':'+ New Order',
    '+ 新增船運批次':'+ New Shipment',
    '+ 新增客戶':'+ New Customer',
    '+ 新增供應商':'+ New Supplier',
    '+ 新增樣品':'+ New Sample',
    '+ 直接新增報價單':'+ New Quotation',
    '⚙ 報價預設值':'⚙ Quote Defaults',
    '← 返回採購單':'← Back to PO',

    // Filter drawer / mobile
    '☰ 篩選':'☰ Filter',

    // Login screen
    '請輸入帳號與密碼':'Please enter your email and password',
    '密碼':'Password',

    // Customer form
    '聯絡人姓名':'Contact Name',
    '公司名稱':'Company Name',
    '電話':'Phone',
    '國家':'Country',
    '行業':'Industry',
    '新增客戶':'New Customer',
    '泰國 TH':'Thailand TH',
    '台灣 TW':'Taiwan TW',
    '中國 CN':'China CN',
    '新加坡 SG':'Singapore SG',
    '馬來西亞 MY':'Malaysia MY',
    '其他':'Other',

    // Supplier form
    '新增供應商聯絡人':'New Supplier Contact',

    // Placeholder text (common)
    '搜尋產品...':'Search product...',
    '搜尋客戶...':'Search customer...',
    '起始日期':'Start date',
    '結束日期':'End date',
    '至':'to',

    // Common labels
    '供應商':'Supplier',
    '客戶':'Customer',
    '產品':'Product',
    '規格':'Spec',
    '單位':'Unit',
    '數量':'Qty',
    '單價':'Unit Price',
    '金額':'Amount',
    '幣別':'Currency',
    '總金額':'Total Amount',
    '到期日':'Due Date',
    '建立日期':'Created',
    '更新日期':'Updated',
    '優先級':'Priority',
    '來源':'Source',
    '承辦人':'Handler',
    '追蹤號':'Tracking No.',
    '起運港':'Port of Loading',
    '目的港':'Port of Destination',

    // Modal common
    '儲存船運資料':'Save Shipment',
    '建立船運批次':'Create Shipment',
    '船運詳情 / 編輯':'Shipment Details / Edit',
    '船運詳情':'Shipment Details',
    '關聯採購單':'Linked Purchase Orders',
    '產品清單摘要':'Product Summary',
    '產品清單':'Product List',
    '尚未關聯採購單':'No purchase orders linked',
    '尚未關聯產品':'No products yet',
    '尚未產生產品摘要':'No product summary yet',
    '請先建立船運批次，再掛入採購單。':'Create the shipment first, then link purchase orders.',
    '掛入採購單':'Link Purchase Order',
    '— 選擇採購單 —':'— Select PO —',
    '+ 加入此船運':'+ Add to Shipment',
    '移除':'Remove',
    '運輸方式':'Transport Mode',
    '承運商':'Carrier',
    '船名 / 航班':'Vessel / Flight',
    '船運編號':'Shipment No.',

    // Inquiry modal
    '詢價詳情':'Inquiry Details',
    '新增詢價':'New Inquiry',
    '送去報價':'Send to Quote',
    '聯絡供應商':'Contact Supplier',
    '供應商截止日':'Supplier Deadline',
    '可否製作':'Can Make',
    '交期':'Lead Time',
    '最低訂量':'MOQ',
    '原料':'Raw Material',
    '供應商報價':'Supplier Price',
    '利潤率':'Margin %',
    '已發文件':'Doc Sent',

    // Quote modal
    '報價詳情':'Quotation Details',
    '新增報價單':'New Quotation',
    '版本':'Version',
    '有效期限':'Valid Until',
    '成本':'Cost',
    '關稅 %':'Customs %',
    '含關稅':'Apply Customs',
    '最終報價':'Final Price',

    // Order modal
    '訂單詳情':'Order Details',
    '新增訂單':'New Order',
    '訂單日期':'Order Date',
    '預計交期':'Expected Delivery',
    '實際交期':'Actual Delivery',
    '出貨追蹤':'Tracking',
    '訂單品項':'Order Items',
    '+ 新增品項':'+ Add Item',

    // Purchase order
    '採購單詳情':'PO Details',
    '新增採購單':'New Purchase Order',
    '採購日期':'PO Date',
    '會計編號':'Accounting No.',
    '採購品項':'PO Items',
    '已收數量':'Received Qty',
    '卷數':'Rolls',
    '寬幅 (mm)':'Width (mm)',

    // Sample modal
    '樣品詳情':'Sample Details',
    '新增樣品':'New Sample',
    '庫存數量':'Stock Qty',
    '索樣記錄':'Inbound Requests',
    '寄樣記錄':'Outbound Shipments',
    '+ 索樣':'+ Request Sample',
    '+ 寄樣':'+ Send Sample',
    '到貨日':'Received Date',
    '寄出日':'Shipped Date',
    '客戶回饋':'Customer Feedback',
    '索樣成本':'Sample Cost',

    // Task modal
    '工作詳情':'Task Details',
    '新增工作':'New Task',
    '標題':'Title',
    '截止日':'Due Date',
    '關聯模組':'Related Module',
    '關聯ID':'Related ID',

    // Product modal
    '產品詳情':'Product Details',
    '新增產品':'New Product',
    '產品代碼':'Product Code',
    '產品名稱':'Product Name',
    '成本價':'Cost Price',
    '最低庫存':'Min Stock',
    '現有庫存':'Stock Qty',
    '下次審閱':'Next Review',
    '審閱週期 (天)':'Review Cycle (days)',
    '啟用中':'Active',

    // Document modal
    '文件詳情':'Document Details',
    '新增文件':'New Document',
    '文件類型':'Doc Type',
    '檔案大小':'File Size',
    '標籤':'Tags',
    '文件連結':'File URL',

    // Settings
    '預設報價幣別':'Default Quote Currency',
    '預設成本幣別':'Default Cost Currency',
    '預設關稅 %':'Default Customs %',
    '預設利潤率 %':'Default Margin %',
    '儲存設定':'Save Settings',

    // User management
    '使用者詳情':'User Details',
    '新增使用者':'New User',
    '角色':'Role',
    '管理者':'Manager',
    '業務助理':'Assistant',
    '啟用':'Active',

    // Toast / status messages (common)
    '載入中...':'Loading...',
    '尚無資料':'No data',
    '尚無詢價資料':'No inquiries',
    '尚無報價資料':'No quotations',
    '尚無樣品資料':'No samples',
    '尚無工作資料':'No tasks',
    '尚無訂單資料':'No orders',
    '尚無船運資料':'No shipments',
    '尚無採購單資料':'No purchase orders',
    '尚無客戶資料':'No customers',
    '尚無供應商資料':'No suppliers',
    '尚無產品資料':'No products',
    '尚無文件資料':'No documents',

    // Overdue / review alerts
    '逾期':'Overdue',
    '即將到期':'Due Soon',
    '待審閱':'Review Due',

    // Supplier form labels
    '姓名':'Name',
    '公司':'Company',
    '職務':'Role / Title',
    '專長產品':'Specialty',
    '郵件稱謂':'Salutation',
    'LINE ID':'LINE ID',

    // Product filter
    '搜尋產品名稱、料號...':'Search product name, code...',
    '正常':'OK',
    '即將到期':'Due Soon',
    '需更新':'Needs Update',

    // Purchase order statuses
    '待審批':'Pending Approval',
    '已審批':'Approved',
    '已發給供應商':'Sent to Supplier',
    '已到貨':'Received',
    '已拒絕':'Rejected',

    // Purchase shopping
    '採購車':'Cart',
    '從訂單帶入品項':'Import from Orders',
    '展開 ▾':'Expand ▾',
    '收起 ▴':'Collapse ▴',
    '前往結算':'Checkout',
    '🛒 開始採購':'🛒 Start Purchase',
    '確認採購':'Confirm Purchase',
    '確認建立採購單':'Confirm Create PO',
    '會計編號（選填）':'Accounting No. (optional)',
    '預計交貨日':'Expected Delivery',
    '備註說明...':'Notes...',
    '僅管理者可調整全域規則':'Only managers can adjust global settings',

    // Document library
    '搜尋產品、文件類型、標籤...':'Search product, doc type, tags...',
    '業務助理可直接搜尋並複製連結給客戶':'Staff can search and copy links to share with customers',
    '+ 上傳新文件':'+ Upload Document',
    '上傳功能即將開放':'Upload feature coming soon',

    // + new buttons
    '+ 新增產品':'+ New Product',
    '+ 新增使用者':'+ New User',
    '+ 新增報價單':'+ New Quote',

    // Inquiry statuses (dynamic)
    '待確認':'Pending',
    '已詢問':'Asked',
    '可以做':'Can Make',
    '無法做':'Cannot Make',
    '未知':'Unknown',

    // Common dynamic labels
    '共':'Total',
    '筆':'records',
    '筆採購單':'POs',
    '筆訂單':'orders',
    '筆詢價':'inquiries',
    '筆報價':'quotes',
    '筆樣品':'samples',
    '筆工作':'tasks',
    '筆客戶':'customers',
    '筆供應商':'suppliers',
    '筆產品':'products',
    '筆文件':'documents',
    '筆船運批次':'shipments',

    // Row / card common
    '截止：':'Due: ',
    '建立於':'Created',
    '最後更新':'Last updated',
    '最後聯繫':'Last contact',
    '到期提醒':'Review reminder',
    '尚未回覆':'No reply yet',
    '尚無備註':'No notes',
    '無規格':'No spec',
    '無':'—',

    // Sample statuses
    '已結案':'Closed',

    // Task priority
    '低':'Low',

    // Order / shipment
    '來源採購單':'Source PO',
    '總數量':'Total Qty',
    '產品':'Product',
    '規格':'Spec',

    // Settings
    '儲存設定':'Save Settings',

    // Quote modal
    '直接建立':'Direct',
    '供應商：':'Supplier: ',
    '未填成本':'No cost entered',
    '點擊品項可編輯':'Click item to edit',
    '尚無品項':'No items yet',
    '+ 新增品項':'+ Add Item',
    '儲存草稿':'Save Draft',
    '產生 PDF':'Generate PDF',
    '複製郵件範本':'Copy Email Template',
    '標記為已送客戶':'Mark as Sent to Customer',
    '修改報價':'Edit Quote',
    '客戶接受 ✓':'Customer Accepted ✓',
    '客戶拒絕 ✗':'Customer Rejected ✗',
    '送去訂單 →':'Send to Order →',
    '⚠ 此報價單已送出，如需修改請點「修改報價」':'⚠ This quote has been sent. Click "Edit Quote" to modify.',
    '✓ 客戶已接受，可送去訂單建立正式訂單':'✓ Accepted by customer. Send to Orders to create a formal order.',
    '此報價單已被拒絕':'This quotation was rejected.',
    'PDF 產生功能即將開放':'PDF generation coming soon',
    '郵件範本功能即將開放':'Email template coming soon',
    '▸ 修改歷史（':'▸ Change History (',
    '筆）':' records)',
    '無品項快照':'No item snapshot',
    '產品':'Product',
    '成本':'Cost',
    '幣別':'Currency',
    '利潤%':'Margin%',
    '報價':'Quote Price',

    // Quote item modal labels
    '成本價':'Cost Price',
    '含關稅':'Apply Customs',
    '關稅 %':'Customs %',
    '利潤率 %':'Margin %',
    '報價幣別':'Quote Currency',
    '最終報價':'Final Price',
    '客戶計價單位':'Customer Pricing Unit',
    '寬幅':'Width',
    '未填':'Not entered',
    '實際利潤率：':'Actual margin: ',

    // Quote list row
    '筆符合 / ':'matched / ',
    '筆進行中 / 共':'active / total',

    // Order list rows
    '訂單詳情':'Order Details',
    '缺少寬幅':'Missing width',
    '已審批':'Approved',
    '待審批':'Pending Approval',
    '審批通過':'Approved',
    '拒絕審批':'Reject',
    '確認取消此訂單？':'Confirm cancel this order?',

    // Purchase list rows & modal
    '草稿':'Draft',
    '生產中':'In Production',
    '已出貨':'Shipped',
    '已到貨':'Received',
    '完成到貨登記':'Mark Received',
    '分配給客戶訂單':'Allocate to Customer Order',
    '+ 新增關聯訂單':'+ Link Order',
    '關聯客戶訂單':'Linked Customer Orders',
    '來源訂單':'Source Order',
    '分配':'Allocated',
    '收貨':'Receive',
    '已收':'Received',
    '待收':'Pending',
    '卷':'rolls',

    // Customer / supplier rows
    '聯絡人':'Contact',
    '回顧提醒':'Review Reminder',
    '天後需回顧':'days until review',
    '逾期未回顧':'Review overdue',
    '尚無回顧記錄':'No review history',

    // Product catalog rows
    '成本：':'Cost: ',
    '庫存：':'Stock: ',
    '最低庫存：':'Min stock: ',
    '下次審閱：':'Next review: ',
    '已停用':'Inactive',
    '天後審閱':'days to review',
    '需審閱':'Review needed',
    '+ 新增品項（手動）':'+ Add Item (manual)',

    // Inquiry row
    '⚠ 待追詢':'⚠ Follow up',
    '提醒中':'Reminder',
    ' 天未回覆':' days no reply',
    '已結案（':'Closed (',
    '無符合條件的詢價':'No matching inquiries',
    '筆進行中 / 共 ':'active / total ',
    '筆':'records',

    // Task row
    '到期 ':'Due: ',
    '⚠ 已逾期':'⚠ Overdue',
    '無到期日':'No due date',
    '✓ 完成':'✓ Done',
    '已完成（':'Completed (',
    '尚無工作項目':'No tasks',

    // Order row
    ' · 預計 ':' · ETA: ',
    ' 品項':' items',
    '筆訂單':'orders',

    // Purchase row
    '尚未掛入任何船運批次':'Not linked to any shipment',
    '筆採購單':'purchase orders',

    // Sample row
    '庫存 ':'Stock: ',
    ' · 索取 ':' · Requests: ',
    ' · 寄出 ':' · Shipped: ',
    '筆樣品':'samples',

    // Product row / card
    '確認：':'Confirmed: ',
    '上次確認：':'Last confirmed: ',
    '剩 ':'',
    ' 天':' days',
    '已過 ':'Overdue by ',
    ' 天':'d',
    '天週期）':'d cycle)',
    ' （':'  (',
    '成本 ':'Cost: ',
    '尚無產品，點「新增產品」開始建立目錄':'No products yet. Click "+ New Product" to start.',
    '個產品':'products',

    // Product modal
    '編輯產品':'Edit Product',
    '每卷米數':'Meters per Roll',
    '固定規格填入，客製化留空':'Fill for fixed-spec products; leave blank for custom',
    '規格說明、注意事項...':'Spec notes, important details...',
    '更新週期':'Review Cycle',
    '30 天（油價波動期）':'30 days (volatile market)',
    '60 天':'60 days',
    '90 天（預設）':'90 days (default)',
    '180 天':'180 days',
    '365 天':'365 days',
    '自訂':'Custom',
    '輸入天數':'Enter days',
    '上次確認日期':'Last Confirmed Date',
    '上架狀態':'Active Status',
    '上架中':'Active',
    '已下架':'Inactive',
    '🔄 重新詢價':'🔄 Re-Inquire',
    '刪除':'Delete',

    // Purchase order modal continued
    '新增採購單':'New Purchase Order',
    '採購單詳情':'Purchase Order Details',
    '尚未掛入任何船運批次':'No shipment linked',
    '— 選擇訂單 —':'— Select Order —',
    '櫃號 ':'Container: ',

    // Customer list
    '筆客戶':'customers',

    // Supplier list
    '筆供應商':'suppliers',

    // Supplier rows
    ' 家供應商 / ':' companies / ',
    '尚無供應商資料':'No suppliers yet',
    '新增供應商聯絡人':'New Supplier Contact',

    // Customer rows
    ' 家客戶 / ':' companies / ',
    ' 位聯絡人':' contacts',
    '需回顧':'Review Due',
    '上次回顧：':'Last reviewed: ',
    '詳情':'Details',
    '新增客戶聯絡人':'New Customer Contact',
    '新增同公司聯絡人':'New Contact (Same Company)',

    // Settings panel
    '只有管理者可以查看系統設定':'Only managers can view system settings',
    '僅管理者可調整全域規則':'Only managers can adjust global settings',
    '報價預設值':'Quote Defaults',
    '客戶管理規則':'Customer Rules',
    '產品管理規則':'Product Rules',
    '詢價追蹤通知':'Inquiry Follow-up Alerts',
    '預設成本幣別':'Default Cost Currency',
    '預設報價幣別':'Default Quote Currency',
    '預設關稅 %':'Default Customs %',
    '預設利潤率 %':'Default Margin %',
    '預設含關稅':'Apply Customs by Default',
    '預設清關手續費 %':'Default Customs Fee %',
    '預設利潤 %':'Default Margin %',
    '統一客戶回顧週期（天）':'Unified Customer Review Cycle (days)',
    '統一產品更新週期（天）':'Unified Product Review Cycle (days)',
    '儲存後，所有客戶都會使用同一個回顧週期。':'After saving, all customers will use this review cycle.',
    '儲存後，所有產品都會使用同一個更新週期。':'After saving, all products will use this review cycle.',
    '提醒天數（黃）':'Warning Days (yellow)',
    '超時天數（紅）':'Overdue Days (red)',
    'pending / asked 狀態下，超過提醒天數標黃，超過超時天數標紅並列入待追詢提醒。':'In pending/asked status: yellow after warning days, red after overdue days — listed as follow-up required.',
    '儲存設定':'Save Settings',
    '設定已儲存':'Settings saved',
    '儲存設定失敗：':'Failed to save settings: ',

    // Misc dynamic
    '沒有符合篩選條件的報價':'No matching quotations',
    '尚無報價，從詢價頁按「收到成本 → 送去報價」，或點「直接新增報價單」':'No quotes yet. Use "Cost Received → Send to Quote" from Inquiries, or click "+ New Quotation".',
    '筆符合':'matched',
    '共':'Total',
    '進行中':'Active',
    '已完成':'Completed',
    '已取消':'Cancelled',

    // Section titles (dynamic)
    '基本資料':'Basic Info',
    '品項明細':'Line Items',
    '船運資訊':'Shipment Info',
    '供應商回覆':'Supplier Reply',
    '報價預設值':'Quote Defaults',
    '客戶管理規則':'Customer Rules',
    '產品管理規則':'Product Rules',
    '詢價追蹤通知':'Inquiry Follow-up Alerts',

    // Inquiry modal labels
    '詢價建立日':'Inquiry Date',
    '供應商回覆追蹤':'Supplier Reply Tracking',
    '更新狀態':'Update Status',
    '供應商回覆':'Supplier Reply',
    '能否生產':'Can Produce',
    '可以':'Yes',
    '不可以':'No',
    '需修改規格':'Spec Adjustment Needed',
    '最低起訂量 MOQ':'Min. Order Qty (MOQ)',
    '原料條件':'Raw Material Terms',
    '原料廠商提供':'Provided by supplier',
    '供應商成本報價（內部）':'Supplier Cost (Internal)',
    '成本金額':'Cost Amount',
    '收到成本 → 送去報價':'Cost Received → Send to Quote',
    '產生詢問供應商訊息':'Generate Supplier Message',
    '收起範本':'Collapse Template',
    '📌 建立追蹤工作':'📌 Create Tracking Task',
    '📦 加入產品目錄':'📦 Add to Catalog',
    '📦 同步更新產品目錄成本':'📦 Sync Catalog Cost',
    '複製訊息':'Copy Message',
    '收件人：':'To: ',
    '已 ':'Already ',
    '天未回覆':' days without reply',
    '已等待 ':'Waiting: ',
    '天':' days',
    '目前不列入未回覆追蹤':'Not tracked for non-reply',

    // Add to product overlay
    '加入產品目錄':'Add to Product Catalog',
    '來自詢價：':'From inquiry: ',
    '料號':'Product Code',
    '— 選擇供應商 —':'— Select Supplier —',
    '統一更新週期（天）':'Review Cycle (days)',
    'Active（現行產品）':'Active',
    'Inactive（暫不使用）':'Inactive',
    '備註 / 規格說明':'Notes / Spec',
    '加入目錄':'Add to Catalog',

    // Sample modal
    '基本資料':'Basic Info',
    '庫存數量':'Stock Qty',
    '關聯詢價 ID':'Linked Inquiry ID',
    '索取記錄（向供應商）':'Inbound Requests (from Supplier)',
    '寄出記錄（給客戶）':'Outbound Shipments (to Customer)',
    '數量':'Qty',
    '索取日期':'Request Date',
    '快遞單號':'Tracking No.',
    '寄出日期':'Ship Date',
    '回饋結果':'Feedback Result',
    '回饋內容':'Feedback Notes',
    '— 選擇 —':'— Select —',

    // Task modal
    '關聯模組':'Related Module',
    '關聯 ID':'Related ID',
    '到期日':'Due Date',
    '優先級':'Priority',

    // Order modal — new order
    '訂單編號':'Order No.',
    '訂單日期':'Order Date',
    '預計交期':'Expected Delivery',
    '實際到貨日':'Actual Delivery',
    '運輸方式':'Transport',
    '訂單來源':'Order Source',
    'confirmed — 正式訂單':'confirmed — Formal Order',
    'verbal — 口頭承諾':'verbal — Verbal Commitment',
    '品項明細':'Line Items',
    '可手動輸入或從目錄帶入':'Type or select from catalog',
    '選自產品目錄':'Pick from Catalog',
    '計價單位':'Pricing Unit',
    '平方米 m²':'m² (sq.meter)',
    '米 m':'m (meter)',
    '寬幅（mm）':'Width (mm)',
    '例如 1070（m²計價時必填）':'e.g. 1070 (required for m² pricing)',
    'm（米）':'m (meter)',
    'm²（平方米）':'m² (sq.meter)',
    'roll（卷）':'roll',
    '狀態操作（暫不使用）':'Status Operations (not in use)',
    '取消原因':'Cancellation Reason',
    '例如：客戶改單、測試資料作廢、品項未確認':'e.g. Customer revision, test data, items unconfirmed',
    '船運資訊':'Shipment Info',

    // Order modal — order link
    '客戶訂單':'Customer Order',
    '— 選擇訂單 —':'— Select Order —',
    '分配數量':'Allocated Qty',
    '例如 100':'e.g. 100',
    '選填，例如首批急單':'Optional, e.g. first urgent batch',
    '採購單品項':'PO Item',

    // Purchase order modal
    '會計編號':'Accounting No.',
    '選填':'Optional',
    '預計交貨日':'Expected Delivery',
    '品項明細':'Line Items',
    '+ 新增品項':'+ Add Item',
    '選自產品目錄':'Pick from Catalog',
    '數量':'Qty',
    '選填':'Optional',
    '計價單位':'Pricing Unit',
    '寬幅（mm）':'Width (mm)',
    '例如 1070':'e.g. 1070',
    '選擇訂單':'Select Order',
    '逾時提醒':'Overdue Alert',
    '超過 ':'Over ',
    ' 天提醒，超過 ':' days = warning, over ',
    ' 天列為待追詢':' days = overdue',

    // New inquiry form
    '產品需求':'Product Requirement',
    '規格詳細說明':'Detailed Spec',
    '幅寬、克重、矽化量、表面張力...':'Width, GSM, silicone amount, surface tension...',
    '— 選擇供應商公司 —':'— Select Supplier Company —',

    // Customer / Supplier edit
    '角色':'Role',
    '初始密碼':'Initial Password',
    '逾期提醒':'Overdue Reminder',

    // User management
    '使用者已新增':'User added',
    '使用者資料已更新':'User updated',
    '已刪除':'Deleted',
    ' 位使用者':' users',
    '尚無使用者資料':'No users yet',
    '啟用':'Active',
    '停用':'Inactive',
    '（我）':'(me)',
    '一般使用者':'User',
    '經理':'Manager',
    '系統管理員':'Admin',
    '儲存資料':'Save',
    '修改我的密碼':'Change My Password',
    '重設密碼':'Reset Password',
    '目前密碼':'Current Password',
    '新密碼':'New Password',
    '確認新密碼':'Confirm New Password',
    '再次輸入新密碼':'Re-enter new password',
    '確認重設':'Confirm Reset',
    '請填寫所有欄位':'Please fill in all fields',
    '驗證目前密碼失敗：':'Failed to verify current password: ',
    '目前密碼不正確':'Current password is incorrect',
    '新密碼與確認密碼不一致':'Passwords do not match',
    '密碼至少需要 4 個字元':'Password must be at least 4 characters',
    '密碼已更新':'Password updated',
    '密碼已重設':'Password reset',
    '重設失敗：':'Reset failed: ',
    '請輸入新密碼':'Please enter a new password',
    '請填寫姓名與 Email':'Please fill in name and email',
    '重設「':'Reset password for "',
    '」的密碼':'"',
    '確定要停用此使用者嗎？':'Confirm deactivate this user?',
    '確定要啟用此使用者嗎？':'Confirm activate this user?',
    '確定要刪除使用者「':'Confirm delete user "',
    '」嗎？':'"?',
    '已停用':'Deactivated',
    '已啟用':'Activated',
    '停用失敗：':'Failed to deactivate: ',
    '啟用失敗：':'Failed to activate: ',

    // Quote item modal
    '供應商成本':'Supplier Cost',
    '📦 更新目錄成本':'📦 Update Catalog Cost',
    '非目錄':'Not in catalog',
    '清關手續費 %':'Customs Fee %',
    '套用':'Apply',
    '報價（含清關含利潤）':'Quote (incl. customs & margin)',
    '利潤率 ':'Margin: ',
    '寬幅':'Width',
    '來自目錄':'From catalog',
    '計價單位（成本）':'Pricing Unit (cost)',
    '報給客戶的單位':'Customer Pricing Unit',

    // Document library
    '找不到相關文件':'No matching documents',
    '複製連結':'Copy Link',
    '已複製：':'Copied: ',
    ' 的連結':' link',
    '請手動複製':'Please copy manually',

    // Confirm modal (generic)
    '確定要刪除嗎？':'Confirm delete?',
    '確定要刪除這筆樣品嗎？':'Confirm delete this sample?',
    '確定要刪除這筆工作嗎？':'Confirm delete this task?',
    '確定要刪除此訂單嗎？':'Confirm delete this order?',
    '確定要拒絕此口頭承諾訂單嗎？':'Confirm reject this verbal order?',
    '確定要取消此採購單嗎？':'Confirm cancel this PO?',
    '有商品在採購車中，確定要放棄並返回嗎？':'Items in cart — discard and go back?',
    '切換供應商將清空採購車，確定嗎？':'Switching supplier will clear the cart. Continue?',
    '有未儲存的變更，確定要離開嗎？':'You have unsaved changes — leave anyway?',
    '確定':'Confirm',
    '此操作無法復原。':'This action cannot be undone.',

    // Login screen
    '請輸入帳號與密碼':'Enter your email and password',
    '帳號或密碼錯誤':'Incorrect email or password',
    '帳號已停用，請聯絡管理員':'Account is inactive. Contact your administrator.',
    '已登入':'Logged in',
    '登入成功':'Login successful',

    // Topbar overdue alert
    '筆逾期':'overdue',
    '筆即將到期':'due soon',

    // Dropdown placeholders
    '— 手動輸入 / 從產品目錄帶入 —':'— Manual / from catalog —',
    '— 選擇客戶 —':'— Select Customer —',
    '— 選擇採購單品項 —':'— Select PO Item —',

    // Empty state messages
    '此訂單目前沒有對應的採購單':'No purchase orders linked to this order',
    '沒有符合條件的產品':'No matching products',
    '目前沒有可選產品':'No products available',
    '此供應商沒有可帶入的訂單品項':'No order items available for this supplier',
    '尚未新增品項':'No items added yet',
    '尚無寄出記錄':'No shipments yet',
    '尚無產品目錄':'No product catalog yet',
    '尚無索取記錄':'No sample requests yet',
    '尚未選擇品項，點右上角按鈕從目錄選擇':'No items — use the button to select from catalog',
    '尚未選購任何產品':'No products selected yet',
    '此供應商沒有產品目錄':'This supplier has no product catalog',
    '此訂單尚無品項':'No items on this order',

    // Filter labels
    '工作篩選':'Filter Tasks',
    '採購單篩選':'Filter POs',
    '報價篩選':'Filter Quotes',
    '樣品篩選':'Filter Samples',
    '船運篩選':'Filter Shipments',
    '訂單篩選':'Filter Orders',
    '詢價篩選':'Filter Inquiries',
    '產品篩選':'Filter Products',

    // Info / label strings
    '未填報價':'No quote',
    '回饋：':'Feedback: ',
    '來自訂單':'From order',
    '目前目錄成本：':'Current catalog cost: ',
    '上次更新：':'Last updated: ',
    '上次回顧日期':'Last Reviewed',
    '· 供應商：':'· Supplier: ',
    '· 含清關':'· incl. customs',
    '· 單價':'· Unit Price',
    '· 報價':'· Quote',
    '· 寬':'· W',
    '· 已滿足':'· Fulfilled',
    '· 成本':'· Cost',
    '· 數量':'· Qty',
    '· 未滿足':'· Unfulfilled',
    '（規格待補充）':'(spec pending)',
    '（訂單':'(Order ',
    '[取消記錄]':'[cancel log]',
    '%) · 報價':'%) · Quote',
    '🛒 採購':'🛒 Purchase',
    '採購品項：':'PO Items: ',
    '本次供應商報價：':'Supplier quote this time: ',
    '本次到貨':'Current arrival',
    '前版本':'Previous version',
    '新版本 v':'New version v',
    '此關聯':'This link',
    '的訊息':' message',
    '安全庫存 / 未分配':'Safety stock / Unallocated',
    '統一回顧週期（天）':'Review cycle (days)',
    '舊版單一關聯欄位':'Legacy single-link field',
    '缺少產品關聯或成本資料':'Missing product link or cost data',
    '清關費 %':'Customs %',
    '米,m²,公斤':'m,m²,kg',
    '主動備貨':'Proactive stock',
    '，前版報價已記錄於修改歷史':', previous quote saved in history',

    // Modal / dialog titles & module names
    '從產品目錄選擇':'Select from Catalog',
    '快速新增客戶':'Quick Add Customer',
    '客戶詳情':'Customer Details',
    '供應商詳情':'Supplier Details',
    '內部詢價':'Internal Inquiry',
    '報價快照':'Quote Snapshot',
    '成本更新影響提醒':'Cost Update Impact Notice',
    '為採購品項分配訂單':'Allocate Order to PO Item',
    '採購選購':'Shopping Cart',
    '業務系統登入':'System Login',
    '新增關聯客戶訂單':'Link Customer Order',
    '建立詢價單':'Create Inquiry',
    '新增詢價單':'New Inquiry',
    '建立報價單':'Create Quote',

    // Buttons
    '儲存回饋':'Save Feedback',
    '儲存品項':'Save Item',
    '儲存基本資料':'Save Info',
    '加入品項':'Add Item',
    '確認寄出':'Confirm Shipment',
    '確認索取':'Confirm Request',
    '標記已出貨 →':'Mark Shipped →',
    '標記已到貨 →':'Mark Received →',
    '取消採購單':'Cancel PO',
    '取消訂單':'Cancel Order',
    '刪除樣品':'Delete Sample',
    '刪除訂單':'Delete Order',
    '前往採購單':'Go to PO',
    '+ 從目錄選擇':'+ From Catalog',
    '+ 新客戶':'+ New Customer',
    '不更新，直接送報價':'Skip update, send to quote',
    '僅更新目錄，不動報價單':'Update catalog only',
    '同步更新目錄並送報價':'Update catalog & send to quote',
    '加入採購車':'Add to Cart',
    '審批通過 ✓':'Approve ✓',
    '標記完成 ✓':'Mark Complete ✓',
    '標記已到貨':'Mark Received',
    '標記為已發給供應商 →':'Mark as Sent to Supplier →',
    '標記生產中 →':'Mark In Production →',
    '為勾選的報價單產生新版本':'New version for selected quotes',
    '登記到貨':'Record Arrival',
    '登記回饋':'Record Feedback',
    '📌 追蹤':'📌 Track',
    '＋ 新增同公司聯絡人':'＋ Add Contact (same company)',
    '輸入報給客戶的價格':'Enter price for customer',
    '已寄出':'Shipped',
    '已標記今日回顧':'Marked as reviewed today',
    '已滿足':'Fulfilled',
    '未滿足':'Unfulfilled',
    '✓ 已加入':'✓ Added',
    '✓ 已審批通過':'✓ Approved',
    '✗ 審批已拒絕':'✗ Rejected',
    '⏳ 等待主管審批':'⏳ Awaiting approval',
    '等待主管審批':'Awaiting approval',
    '成本未填':'Cost missing',
    '找不到符合產品':'No matching product',
    '未知客戶':'Unknown customer',
    '無關聯':'No link',
    '詢價單':'Inquiry',
    '詢價提醒天數':'Inquiry reminder days',
    '詢價超時天數':'Inquiry overdue days',
    '查無此帳號':'Account not found',
    '此帳號已停用，請聯絡管理員':'Account is inactive. Contact your administrator.',
    '只有管理者可以儲存系統設定':'Only managers can save system settings',
    '⚠ 口頭承諾訂單需要主管審批後才能建立採購單':'⚠ Verbal orders require manager approval before creating a PO',
    '⚠ 缺少寬幅，請在下方補填':'⚠ Width missing — please fill in below',
    '⚠ 請填寫寬幅才能計算 m² 金額':'⚠ Please enter width to calculate m² amount',
    '此為口頭承諾訂單，請審批後才可建立採購單。':'This is a verbal order. Approval required before creating a PO.',
    '此動作會將訂單標記為取消，並留下取消記錄。請填寫取消原因後再確認。':'This will mark the order as cancelled. Please enter a reason before confirming.',
    '此訂單尚未對應任何採購單，若為安全庫存採購則可不關聯訂單。':'No PO linked yet. If purchasing for safety stock, no order link is required.',
    '此關聯僅表示這張採購單的一部分數量分配給哪張客戶訂單；未分配數量會視為安全庫存。':'This link shows what portion of the PO is allocated to a customer order; unallocated qty is treated as safety stock.',
    '泰國供應商，不套用清關費':'Thai supplier — no customs fee',
    '海外供應商，套用清關費':'Overseas supplier — customs fee applied',
    '以下報價單包含此產品，成本可能已過期，請勾選要產生新版本的報價單：':'The following quotes include this product with a possibly outdated cost. Select quotes to version:',
    '請填寫姓名和公司':'Please fill in name and company',
    '請至少勾選一張報價單':'Please select at least one quote',
    '請輸入 Email':'Please enter an email',
    '船運需由採購單掛入':'Shipments must be linked via PO',
    '的船運資訊，請從相關採購單進行關聯。':' shipment info — link via the related PO.',
    '待審批口頭承諾訂單：':'Verbal orders pending approval: ',
    '待審批採購單：':'POs pending approval: ',
    '回顧客戶資料：':'Review customer: ',
    '+ 向供應商索取':'+ Request from Supplier',
    '+ 寄給客戶':'+ Ship to Customer',
    '3 天內':'within 3 days',
    'JOY CHIN PSA — 業務系統':'JOY CHIN PSA — Business System',
    '修改報價前快照':'Pre-edit quote snapshot',
    '品項已新增':'Item added',
    '樣品需求':'Sample Requirement',
    '請輸入密碼':'Please enter your password',
    '請透過相關採購單掛入船運批次。':'Link shipments via the related PO.',
    '選擇產品目錄':'Select from Catalog',
    '選自目錄':'From catalog',
    '部分品項無法自動更新成本，請手動確認':'Some items cannot be auto-updated — please verify manually',
    '需審批後才能建立採購單':'Approval required before creating a PO',
    '📌 追蹤工作已建立':'📌 Tracking task created',
    '/ 原因：':'/ Reason: ',
    '✓ 已回顧':'✓ Reviewed',
    '→ 前往原單據':'→ View Source',

    // Misc
    '版本號':'Version',
    '確認新增':'Confirm Add',
    '確認刪除':'Confirm Delete',
    '確認儲存':'Confirm Save',
    '錯誤':'Error',
    '成功':'Success',
    '警告':'Warning',
    '請稍候...':'Please wait...',
    '重試':'Retry',
  }

  // Toast prefix map: Chinese prefix → English prefix (for dynamic messages)
  const TOAST_PREFIX=[
    // Confirm modal dynamic strings
    ['確定要移除 ','Confirm remove: '],
    ['確定要刪除「','Confirm delete "'],
    ['確定要','Confirm: '],
    // Overdue alert dynamic strings (textContent set directly)
    ['⚠ ','⚠ '],
    ['只有管理者可以查看系統設定','Only managers can view system settings'],
    ['只有管理者可以調整系統設定','Only managers can adjust system settings'],
    ['已建立新版本','New version created'],
    ['已送去報價','Sent to quotation'],
    ['已儲存修改前快照，請更新報價內容後重新送出','Snapshot saved. Please update the quote and re-submit.'],
    ['已儲存修改前快照','Snapshot saved'],
    ['已複製，可貼到 Email 或 WhatsApp','Copied — paste into Email or WhatsApp'],
    ['複製失敗，請手動複製','Copy failed — please copy manually'],
    ['採購單已建立','Purchase order created'],
    ['採購單已儲存','Purchase order saved'],
    ['採購單已審批通過','Purchase order approved'],
    ['採購單已拒絕','Purchase order rejected'],
    ['採購單已取消','Purchase order cancelled'],
    ['採購單已掛入船運批次','PO linked to shipment'],
    ['採購單已移出船運批次','PO removed from shipment'],
    ['採購單車為空','Cart is empty'],
    ['採購車為空','Cart is empty'],
    ['分配已加入暫存','Allocation staged'],
    ['分配已新增','Allocation added'],
    ['關聯客戶訂單已新增','Order link added'],
    ['關聯客戶訂單已移除','Order link removed'],
    ['全部品項已到齊，採購單狀態更新為已到貨','All items received — PO marked as received'],
    ['到貨已登記','Arrival recorded'],
    ['品項已加入','Item added'],
    ['品項已儲存','Item saved'],
    ['品項已刪除','Item deleted'],
    ['已加入產品目錄','Added to product catalog'],
    ['訂單已建立','Order created'],
    ['訂單已更新','Order updated'],
    ['訂單已刪除','Order deleted'],
    ['狀態已更新','Status updated'],
    ['訂單審批通過','Order approved'],
    ['訂單審批已拒絕','Order approval rejected'],
    ['追蹤工作已建立','Tracking task created'],
    ['樣品已新增','Sample added'],
    ['樣品資料已更新','Sample updated'],
    ['樣品已刪除','Sample deleted'],
    ['索取記錄已新增','Sample request added'],
    ['已標記到貨，庫存已更新','Marked as received — stock updated'],
    ['寄出記錄已新增，庫存已扣除','Shipment recorded — stock deducted'],
    ['回饋已登記','Feedback recorded'],
    ['工作已新增','Task added'],
    ['工作已更新','Task updated'],
    ['船運批次已建立','Shipment created'],
    ['船運資料已更新','Shipment updated'],
    ['已有進行中的追蹤工作','Tracking task already exists'],
    ['上傳功能即將開放','Upload feature coming soon'],
    ['沒有變更','No changes'],
    // Error prefixes
    ['新增失敗：','Failed to add: '],
    ['儲存失敗：','Failed to save: '],
    ['刪除失敗：','Failed to delete: '],
    ['更新失敗：','Failed to update: '],
    ['建立失敗：','Failed to create: '],
    ['審批失敗：','Failed to approve: '],
    ['操作失敗：','Operation failed: '],
    ['取消失敗：','Failed to cancel: '],
    ['移除失敗：','Failed to remove: '],
    ['品項新增失敗：','Failed to add item: '],
    ['品項建立失敗：','Failed to create item: '],
    ['載入船運失敗：','Failed to load shipments: '],
    ['載入採購單失敗：','Failed to load POs: '],
    ['送去報價失敗：','Failed to send to quote: '],
    ['快照儲存失敗：','Failed to save snapshot: '],
    ['狀態更新失敗：','Failed to update status: '],
    ['加入採購單失敗：','Failed to add PO: '],
    ['移除採購單失敗：','Failed to remove PO: '],
    ['新增分配失敗：','Failed to add allocation: '],
    ['新增關聯訂單失敗：','Failed to add order link: '],
    ['移除關聯訂單失敗：','Failed to remove order link: '],
    ['儲存船運失敗：','Failed to save shipment: '],
    // Validation
    ['已複製：','Copied: '],
    ['請手動複製','Please copy manually'],
    ['使用者已新增','User added'],
    ['使用者資料已更新','User updated'],
    ['密碼已更新','Password updated'],
    ['密碼已重設','Password reset'],
    ['已停用','Deactivated'],
    ['已啟用','Activated'],
    ['已刪除','Deleted'],
    ['請填寫所有欄位','Please fill in all fields'],
    ['目前密碼不正確','Current password is incorrect'],
    ['新密碼與確認密碼不一致','Passwords do not match'],
    ['密碼至少需要 4 個字元','Password must be at least 4 characters'],
    ['驗證目前密碼失敗：','Failed to verify current password: '],
    ['重設失敗：','Reset failed: '],
    ['停用失敗：','Failed to deactivate: '],
    ['啟用失敗：','Failed to activate: '],
    ['設定已儲存','Settings saved'],
    ['儲存設定失敗：','Failed to save settings: '],
    ['請填寫姓名、公司、國家和 Email','Please fill in name, company, country and email'],
    ['客戶已新增','Customer added'],
    ['客戶資料已更新','Customer updated'],
    ['客戶已刪除','Customer deleted'],
    ['供應商已新增','Supplier added'],
    ['供應商資料已更新','Supplier updated'],
    ['供應商已刪除','Supplier deleted'],
    ['產品已刪除','Product deleted'],
    ['產品已更新','Product updated'],
    ['請填寫產品名稱','Please enter a product name'],
    ['請填寫有效數量','Please enter a valid quantity'],
    ['請填寫必要欄位','Please fill in required fields'],
    ['請填寫品項資料','Please fill in item details'],
    ['請填寫有效的數量與單價','Please enter valid qty and unit price'],
    ['請填寫有效的分配數量','Please enter a valid allocation quantity'],
    ['請填寫工作標題','Please enter a task title'],
    ['請填寫成本價','Please enter a cost price'],
    ['請填寫取消原因','Please enter a cancellation reason'],
    ['請填寫船運編號','Please enter a shipment number'],
    ['請選擇客戶','Please select a customer'],
    ['請選擇供應商','Please select a supplier'],
    ['請先選擇供應商','Please select a supplier first'],
    ['請先選擇要掛入的採購單','Please select a PO to link'],
    ['請先選擇客戶訂單','Please select a customer order'],
    ['請選擇客戶訂單','Please select a customer order'],
    ['請填寫產品需求','Please enter a product requirement'],
    ['請輸入有效數量','Please enter a valid quantity'],
    ['請先新增至少 1 筆產品品項，再建立訂單','Please add at least 1 item before creating the order'],
    ['請先新增至少 1 筆產品品項，再建立採購單','Please add at least 1 item before creating the PO'],
    ['請先新增至少 1 筆產品品項，再標記生產中','Please add at least 1 item before marking as in production'],
    ['請勾選至少一筆品項','Please select at least one item'],
    ['寄出數量不能超過目前庫存','Quantity cannot exceed current stock'],
    ['同一採購品項對同一訂單已存在，請直接調整原本那筆','Duplicate allocation — please edit the existing one'],
    ['同一張訂單與同一採購品項已存在，請直接調整原本那筆','Duplicate link — please edit the existing one'],
    ['此品項尚未綁定產品目錄，暫時無法精準分配訂單','Item not linked to catalog — cannot allocate precisely'],
    ['缺少分配目標','Missing allocation target'],
    ['找不到供應商','Supplier not found'],
    ['找不到採購品項','PO item not found'],
    ['找不到要移除的關聯資料','Link not found'],
    // Additional error prefixes
    ['供應商名稱同步失敗：','Failed to sync supplier name: '],
    ['客戶名稱同步失敗：','Failed to sync customer name: '],
    ['儲存客戶失敗：','Failed to save customer: '],
    ['儲存供應商失敗：','Failed to save supplier: '],
    ['品項儲存失敗：','Failed to save item: '],
    ['品項寫入失敗：','Failed to write item: '],
    ['品項建立失敗，訂單未建立：','Item creation failed — order not created: '],
    ['品項複製失敗：','Failed to copy item: '],
    ['建立新版本失敗：','Failed to create new version: '],
    ['建立訂單失敗：','Failed to create order: '],
    ['建立詢價失敗：','Failed to create inquiry: '],
    ['自動建立工作單失敗：','Failed to auto-create task: '],
    ['無法解析成本金額','Cannot parse cost amount'],
    // Success messages
    ['供應商聯絡人已新增','Supplier contact added'],
    ['供應商資料已儲存','Supplier saved'],
    ['客戶聯絡人已新增','Customer contact added'],
    ['客戶已更新','Customer updated'],
    ['報價已儲存','Quote saved'],
    ['報價預設值已儲存','Quote defaults saved'],
    ['產品已新增','Product added'],
    ['產品目錄成本已更新','Catalog cost updated'],
    ['產品目錄成本有差異','Catalog cost difference detected'],
    ['詢價單已建立','Inquiry created'],
    ['已建立新版本 v','New version created: v'],
    ['已標記今日回顧','Marked as reviewed today'],
    ['新增品項失敗：','Failed to add item: '],
    // Task title prefixes (auto-generated task titles)
    ['追蹤供應商回覆 -','Track supplier reply - '],
    ['追蹤報價：','Track quote: '],
    ['追蹤客戶回饋：','Track customer feedback: '],
    ['追蹤客戶樣品回饋：','Track customer sample feedback: '],
    ['追蹤樣品到貨：','Track sample arrival: '],
    ['追蹤訂單出貨：','Track order shipment: '],
    ['追蹤訂單到貨：','Track order arrival: '],
    ['追蹤詢價：','Track inquiry: '],
    // Additional error/validation prefixes
    ['載入採購單品項失敗：','Failed to load PO items: '],
    ['載入採購單關聯訂單失敗：','Failed to load PO order links: '],
    ['載入船運關聯失敗：','Failed to load shipment links: '],
    ['寄出數量不能超過目前庫存（','Quantity cannot exceed current stock ('],
  ]

  // ── Dynamic pattern translator ────────────────────────────────────────────

  const DYNAMIC_PATTERNS=[
    // overdue alerts: "⚠ 3 筆逾時" → "⚠ 3 overdue"
    [/^(⚠\s*)(\d+)\s*筆逾時/,(_,p,n)=>p+n+' overdue'],
    // "⚠ 2 個產品成本需要更新" → "⚠ 2 products need cost update"
    [/^(⚠\s*)(\d+)\s*個產品成本需要更新\s*/,(_,p,n)=>p+n+' products need cost update  '],
    // "🕐 1 個即將到期" → "🕐 1 due soon"
    [/^(🕐\s*)(\d+)\s*個即將到期/,(_,p,n)=>p+n+' due soon'],
    // task row: "到期 2024-01-01 ⚠ 已逾期" → "Due 2024-01-01 ⚠ Overdue"
    [/^到期\s+(\d{4}-\d{2}-\d{2})\s*(⚠\s*已逾期)?/,(_,d,ov)=>'Due '+d+(ov?' ⚠ Overdue':'')],
    // "到期 2024-01-01 " (no overdue)
    [/^到期\s+(\d{4}-\d{2}-\d{2})\s*$/,(_,d)=>'Due '+d],
    // Number-prefix dynamic strings
    [/^(\d+)\s*張報價單產生新版本/,(_,n)=>n+' quote(s) versioned'],
    [/^(\d+)\s*筆品項已加入採購車/,(_,n)=>n+' item(s) added to cart'],
    [/^(\d+)\s*筆品項已加入/,(_,n)=>n+' item(s) added'],
    [/^(\d+)\s*筆待追詢/,(_,n)=>n+' follow-up required'],
    [/^(\d+)\s*位客戶需要回顧：/,(_,n)=>n+' customers need review: '],
    [/^(\d+)\s*位聯絡人：/,(_,n)=>n+' contact(s): '],
    [/^此供應商共有\s*(\d+)/,(_,n)=>'This supplier has '+n],
    [/^此客戶共有\s*(\d+)/,(_,n)=>'This customer has '+n],
    [/^(\d+)\s*個產品目錄成本需要更新/,(_,n)=>n+' catalog cost(s) need update'],
    // confirm modal with variable: "確定要移除 ABC 的關聯嗎？"
    [/^確定要移除\s+(.+)\s+的關聯嗎？$/,(_,label)=>'Confirm remove link for '+label+'?'],
    // "確定要刪除「X」嗎？"
    [/^確定要刪除「(.+)」嗎？$/,(_,name)=>'Confirm delete "'+name+'"?'],
    // "確定要XXX此使用者嗎？" — handled by DICT, but fallback:
    [/^確定要(.+)此使用者嗎？$/,(_,action)=>'Confirm '+action+' this user?'],
    // "N 筆" counter generic → "N items"
    [/^(\d+)\s*筆$/,(_,n)=>n+' items'],
  ]

  function translateDynamic(text){
    for(const [re,fn] of DYNAMIC_PATTERNS){
      const m=text.match(re)
      if(m)return fn(...m)
    }
    return text
  }

  // ── Core translation engine ───────────────────────────────────────────────

  function applyTranslations(root){
    if(currentLang==='zh')return
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false)
    let node
    while((node=walker.nextNode())){
      const orig=node.nodeValue
      if(!orig||!orig.trim())continue
      const trimmed=orig.trim()
      if(DICT[trimmed]){
        node.nodeValue=orig.replace(trimmed,DICT[trimmed])
      } else {
        // Dynamic pattern replacements
        const t=translateDynamic(trimmed)
        if(t!==trimmed)node.nodeValue=orig.replace(trimmed,t)
      }
    }
    // Also handle placeholder attributes
    root.querySelectorAll&&root.querySelectorAll('[placeholder]').forEach(el=>{
      const p=el.getAttribute('placeholder')
      if(p&&DICT[p])el.setAttribute('placeholder',DICT[p])
    })
    // aria-label
    root.querySelectorAll&&root.querySelectorAll('[aria-label]').forEach(el=>{
      const a=el.getAttribute('aria-label')
      if(a&&DICT[a])el.setAttribute('aria-label',DICT[a])
    })
  }

  function applyToAll(){
    applyTranslations(document.body)
  }

  // ── MutationObserver: catch dynamic DOM changes ───────────────────────────
  let _observer=null
  function startObserver(){
    if(_observer)return
    _observer=new MutationObserver(mutations=>{
      if(currentLang==='zh')return
      for(const m of mutations){
        for(const node of m.addedNodes){
          if(node.nodeType===1)applyTranslations(node)
          else if(node.nodeType===3){
            const t=node.nodeValue&&node.nodeValue.trim()
            if(t&&DICT[t])node.nodeValue=node.nodeValue.replace(t,DICT[t])
          }
        }
      }
    })
    _observer.observe(document.body,{childList:true,subtree:true})
  }

  // ── Language toggle button ────────────────────────────────────────────────
  function injectToggleButton(){
    if(document.getElementById('lang-toggle-btn'))return
    const logoutBtn=document.getElementById('logout-btn')
    if(!logoutBtn)return
    const btn=document.createElement('button')
    btn.id='lang-toggle-btn'
    btn.className='btn btn-ghost btn-sm'
    btn.style.cssText='font-size:12px;flex-shrink:0;display:flex;align-items:center;gap:4px'
    btn.innerHTML=currentLang==='zh'?'🌐 EN':'🌐 中文'
    btn.onclick=()=>{
      if(currentLang==='zh'){
        currentLang='en'
        localStorage.setItem(STORAGE_KEY,'en')
        btn.innerHTML='🌐 中文'
        wrapShowToast()
        wrapConfirmModal()
        applyToAll()
        startObserver()
      }else{
        currentLang='zh'
        localStorage.setItem(STORAGE_KEY,'zh')
        location.reload()
      }
    }
    logoutBtn.parentNode.insertBefore(btn,logoutBtn)
  }

  // ── confirmModal interceptor ──────────────────────────────────────────────
  function wrapConfirmModal(){
    if(typeof window.confirmModal!=='function'||window._confirmModalOriginal)return
    window._confirmModalOriginal=window.confirmModal
    window.confirmModal=(msg,onConfirm)=>{
      const translated=DICT[msg]||translateDynamic(msg)
      window._confirmModalOriginal(translated,onConfirm)
    }
  }

  // ── showToast interceptor ─────────────────────────────────────────────────
  function translateToastMsg(msg){
    if(currentLang==='zh')return msg
    // Exact match
    if(DICT[msg])return DICT[msg]
    // Prefix match
    for(const[zh,en]of TOAST_PREFIX){
      if(msg===zh)return en
      if(msg.startsWith(zh))return en+msg.slice(zh.length)
    }
    return msg
  }
  function wrapShowToast(){
    if(typeof window.showToast!=='function'||window._showToastOriginal)return
    window._showToastOriginal=window.showToast
    window.showToast=(msg,type)=>window._showToastOriginal(translateToastMsg(msg),type)
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init(){
    injectToggleButton()
    if(currentLang==='en'){
      wrapShowToast()
      wrapConfirmModal()
      applyToAll()
      startObserver()
      setTimeout(applyToAll,600)
      setTimeout(applyToAll,1500)
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init)
  }else{
    init()
  }
  // Re-run after app fully loads (showToast may not exist yet at DOMContentLoaded)
  setTimeout(()=>{
    injectToggleButton()
    if(currentLang==='en'){wrapShowToast();wrapConfirmModal();applyToAll()}
  },1000)
})()
