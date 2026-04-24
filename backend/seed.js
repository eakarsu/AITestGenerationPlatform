const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Project, TestCase, TestSuite, CodeAnalysis, BugDetection, CoverageAnalysis, TestTemplate, Team, TestExecution, ApiTest, PerformanceTest, SecurityTest, IntegrationTest, RegressionTest, Report } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = await User.create({
      email: 'demo@testgen.ai',
      password: hashedPassword,
      name: 'Alex Johnson',
      role: 'admin'
    });
    const userId = user.id;

    // Seed Projects (15 items)
    const projects = await Project.bulkCreate([
      { name: 'E-Commerce Platform', description: 'Full-stack e-commerce application with React and Node.js', language: 'JavaScript', framework: 'React/Express', repository: 'github.com/company/ecommerce', status: 'active', userId },
      { name: 'Mobile Banking API', description: 'RESTful API for mobile banking application', language: 'Python', framework: 'FastAPI', repository: 'github.com/company/banking-api', status: 'active', userId },
      { name: 'Healthcare Portal', description: 'Patient management and appointment scheduling system', language: 'TypeScript', framework: 'Next.js', repository: 'github.com/company/healthcare', status: 'active', userId },
      { name: 'Inventory Management', description: 'Warehouse inventory tracking and management system', language: 'Java', framework: 'Spring Boot', repository: 'github.com/company/inventory', status: 'active', userId },
      { name: 'Social Media Dashboard', description: 'Analytics dashboard for social media management', language: 'TypeScript', framework: 'Angular', repository: 'github.com/company/social-dash', status: 'active', userId },
      { name: 'ML Pipeline Service', description: 'Machine learning model training and deployment pipeline', language: 'Python', framework: 'Flask', repository: 'github.com/company/ml-pipeline', status: 'active', userId },
      { name: 'IoT Gateway', description: 'IoT device management and data collection gateway', language: 'Go', framework: 'Gin', repository: 'github.com/company/iot-gateway', status: 'active', userId },
      { name: 'CRM System', description: 'Customer relationship management platform', language: 'JavaScript', framework: 'Vue.js/Express', repository: 'github.com/company/crm', status: 'active', userId },
      { name: 'Payment Gateway', description: 'Secure payment processing microservice', language: 'Java', framework: 'Spring Boot', repository: 'github.com/company/payments', status: 'active', userId },
      { name: 'Content Management', description: 'Headless CMS with GraphQL API', language: 'TypeScript', framework: 'NestJS', repository: 'github.com/company/cms', status: 'active', userId },
      { name: 'Notification Service', description: 'Multi-channel notification delivery service', language: 'Python', framework: 'Django', repository: 'github.com/company/notifications', status: 'active', userId },
      { name: 'Search Engine', description: 'Full-text search service with Elasticsearch integration', language: 'Go', framework: 'Echo', repository: 'github.com/company/search', status: 'active', userId },
      { name: 'Auth Microservice', description: 'Authentication and authorization service with OAuth2', language: 'TypeScript', framework: 'Express', repository: 'github.com/company/auth', status: 'active', userId },
      { name: 'File Storage Service', description: 'Cloud file storage and management API', language: 'Rust', framework: 'Actix', repository: 'github.com/company/storage', status: 'active', userId },
      { name: 'Real-time Chat', description: 'WebSocket-based real-time chat application', language: 'JavaScript', framework: 'Socket.io/React', repository: 'github.com/company/chat', status: 'active', userId }
    ]);

    // Seed Test Cases (15 items)
    await TestCase.bulkCreate([
      { title: 'User Registration Validation', description: 'Test user registration with various input scenarios', code: 'function register(email, password) {\n  if (!email.includes("@")) throw new Error("Invalid email");\n  if (password.length < 8) throw new Error("Password too short");\n  return { email, created: true };\n}', language: 'JavaScript', framework: 'Jest', type: 'unit', priority: 'high', status: 'active', projectId: projects[0].id, userId },
      { title: 'Shopping Cart Calculation', description: 'Test shopping cart total calculation with discounts', code: 'function calculateTotal(items, discount) {\n  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);\n  return subtotal * (1 - discount / 100);\n}', language: 'JavaScript', framework: 'Jest', type: 'unit', priority: 'high', status: 'passed', projectId: projects[0].id, userId },
      { title: 'API Authentication Flow', description: 'Test JWT token generation and validation', code: 'async function authenticate(credentials) {\n  const user = await findUser(credentials.email);\n  if (!user || !await bcrypt.compare(credentials.password, user.hash)) return null;\n  return jwt.sign({ id: user.id }, SECRET);\n}', language: 'JavaScript', framework: 'Mocha', type: 'integration', priority: 'critical', status: 'active', projectId: projects[1].id, userId },
      { title: 'Patient Record CRUD', description: 'Test patient record create, read, update, delete operations', code: 'class PatientService {\n  async create(data) { return db.patient.create(data); }\n  async findById(id) { return db.patient.findByPk(id); }\n  async update(id, data) { return db.patient.update(data, { where: { id } }); }\n  async delete(id) { return db.patient.destroy({ where: { id } }); }\n}', language: 'TypeScript', framework: 'Jest', type: 'integration', priority: 'high', status: 'draft', projectId: projects[2].id, userId },
      { title: 'Inventory Stock Update', description: 'Test concurrent stock update operations', code: 'public synchronized void updateStock(String productId, int quantity) {\n  Product product = repository.findById(productId);\n  if (product.getStock() + quantity < 0) throw new InsufficientStockException();\n  product.setStock(product.getStock() + quantity);\n  repository.save(product);\n}', language: 'Java', framework: 'JUnit', type: 'unit', priority: 'critical', status: 'passed', projectId: projects[3].id, userId },
      { title: 'Social Media Post Analytics', description: 'Test engagement metrics calculation', code: 'function calculateEngagement(post) {\n  const total = post.likes + post.comments + post.shares;\n  return { rate: (total / post.impressions * 100).toFixed(2), total };\n}', language: 'TypeScript', framework: 'Jest', type: 'unit', priority: 'medium', status: 'active', projectId: projects[4].id, userId },
      { title: 'ML Model Prediction', description: 'Test model inference accuracy and response time', code: 'def predict(model, input_data):\n    preprocessed = preprocess(input_data)\n    prediction = model.predict(preprocessed)\n    return {"label": prediction.argmax(), "confidence": float(prediction.max())}', language: 'Python', framework: 'pytest', type: 'unit', priority: 'high', status: 'active', projectId: projects[5].id, userId },
      { title: 'IoT Sensor Data Validation', description: 'Test sensor data parsing and validation', code: 'func ValidateSensorData(data SensorReading) error {\n  if data.Temperature < -50 || data.Temperature > 150 { return ErrInvalidTemp }\n  if data.Humidity < 0 || data.Humidity > 100 { return ErrInvalidHumidity }\n  return nil\n}', language: 'Go', framework: 'testing', type: 'unit', priority: 'medium', status: 'passed', projectId: projects[6].id, userId },
      { title: 'CRM Contact Search', description: 'Test full-text search for contacts', code: 'async function searchContacts(query, filters) {\n  const results = await Contact.find({\n    $text: { $search: query },\n    ...filters\n  }).limit(50).sort({ score: { $meta: "textScore" } });\n  return results;\n}', language: 'JavaScript', framework: 'Mocha', type: 'integration', priority: 'medium', status: 'active', projectId: projects[7].id, userId },
      { title: 'Payment Processing', description: 'Test payment transaction processing with rollback', code: '@Transactional\npublic PaymentResult processPayment(PaymentRequest request) {\n  validateCard(request.getCardDetails());\n  Amount amount = calculateAmount(request);\n  Transaction tx = gateway.charge(amount);\n  return new PaymentResult(tx.getId(), tx.getStatus());\n}', language: 'Java', framework: 'JUnit', type: 'integration', priority: 'critical', status: 'draft', projectId: projects[8].id, userId },
      { title: 'GraphQL Query Resolver', description: 'Test GraphQL article query resolver', code: 'const resolvers = {\n  Query: {\n    articles: async (_, { limit, offset }) => {\n      return Article.findAll({ limit, offset, order: [["createdAt", "DESC"]] });\n    }\n  }\n};', language: 'TypeScript', framework: 'Jest', type: 'unit', priority: 'medium', status: 'active', projectId: projects[9].id, userId },
      { title: 'Email Notification Send', description: 'Test email notification delivery and retry logic', code: 'def send_notification(user_id, template, context):\n    user = User.objects.get(id=user_id)\n    email = render_template(template, context)\n    try:\n        send_email(user.email, email)\n    except SMTPError:\n        retry_queue.push(user_id, template, context)\n        raise', language: 'Python', framework: 'pytest', type: 'integration', priority: 'high', status: 'passed', projectId: projects[10].id, userId },
      { title: 'Search Index Update', description: 'Test search index synchronization', code: 'func UpdateIndex(doc Document) error {\n  index, err := client.Index("documents")\n  if err != nil { return fmt.Errorf("index error: %w", err) }\n  return index.AddDocuments([]Document{doc})\n}', language: 'Go', framework: 'testing', type: 'integration', priority: 'medium', status: 'active', projectId: projects[11].id, userId },
      { title: 'OAuth2 Token Refresh', description: 'Test OAuth2 token refresh flow', code: 'async function refreshToken(refreshToken: string): Promise<TokenPair> {\n  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);\n  const user = await User.findById(decoded.userId);\n  if (!user || user.tokenVersion !== decoded.version) throw new Error("Invalid");\n  return generateTokenPair(user);\n}', language: 'TypeScript', framework: 'Jest', type: 'unit', priority: 'critical', status: 'active', projectId: projects[12].id, userId },
      { title: 'File Upload Validation', description: 'Test file upload size and type validation', code: 'async fn validate_upload(file: &UploadedFile) -> Result<(), ValidationError> {\n  if file.size > MAX_FILE_SIZE { return Err(ValidationError::TooLarge); }\n  if !ALLOWED_TYPES.contains(&file.content_type) { return Err(ValidationError::InvalidType); }\n  Ok(())\n}', language: 'Rust', framework: 'cargo test', type: 'unit', priority: 'high', status: 'draft', projectId: projects[13].id, userId }
    ]);

    // Seed Test Suites (15 items)
    await TestSuite.bulkCreate([
      { name: 'E-Commerce Unit Tests', description: 'All unit tests for e-commerce platform', status: 'active', totalTests: 145, passedTests: 138, failedTests: 7, projectId: projects[0].id, userId },
      { name: 'Banking API Integration', description: 'Integration tests for banking API endpoints', status: 'completed', totalTests: 89, passedTests: 85, failedTests: 4, projectId: projects[1].id, userId },
      { name: 'Healthcare E2E Suite', description: 'End-to-end tests for healthcare portal', status: 'active', totalTests: 67, passedTests: 60, failedTests: 7, projectId: projects[2].id, userId },
      { name: 'Inventory Smoke Tests', description: 'Quick smoke tests for inventory system', status: 'active', totalTests: 32, passedTests: 32, failedTests: 0, projectId: projects[3].id, userId },
      { name: 'Dashboard Component Tests', description: 'React component tests for dashboard', status: 'running', totalTests: 78, passedTests: 65, failedTests: 13, projectId: projects[4].id, userId },
      { name: 'ML Pipeline Validation', description: 'Model validation and accuracy tests', status: 'active', totalTests: 45, passedTests: 42, failedTests: 3, projectId: projects[5].id, userId },
      { name: 'IoT Protocol Tests', description: 'MQTT and CoAP protocol tests', status: 'completed', totalTests: 56, passedTests: 54, failedTests: 2, projectId: projects[6].id, userId },
      { name: 'CRM Regression Suite', description: 'Full regression test suite for CRM', status: 'active', totalTests: 120, passedTests: 112, failedTests: 8, projectId: projects[7].id, userId },
      { name: 'Payment Security Tests', description: 'Security-focused payment tests', status: 'active', totalTests: 95, passedTests: 90, failedTests: 5, projectId: projects[8].id, userId },
      { name: 'CMS Content Tests', description: 'Content creation and management tests', status: 'completed', totalTests: 58, passedTests: 58, failedTests: 0, projectId: projects[9].id, userId },
      { name: 'Notification Delivery Tests', description: 'Multi-channel notification tests', status: 'active', totalTests: 73, passedTests: 68, failedTests: 5, projectId: projects[10].id, userId },
      { name: 'Search Accuracy Tests', description: 'Search relevance and accuracy tests', status: 'active', totalTests: 42, passedTests: 39, failedTests: 3, projectId: projects[11].id, userId },
      { name: 'Auth Flow Tests', description: 'Complete authentication flow tests', status: 'completed', totalTests: 88, passedTests: 86, failedTests: 2, projectId: projects[12].id, userId },
      { name: 'Storage Load Tests', description: 'File storage load and stress tests', status: 'active', totalTests: 35, passedTests: 30, failedTests: 5, projectId: projects[13].id, userId },
      { name: 'Chat WebSocket Tests', description: 'Real-time messaging tests', status: 'running', totalTests: 48, passedTests: 40, failedTests: 8, projectId: projects[14].id, userId }
    ]);

    // Seed Code Analysis (15 items)
    await CodeAnalysis.bulkCreate([
      { title: 'Cart Module Analysis', code: 'class ShoppingCart {\n  constructor() { this.items = []; }\n  addItem(item) { this.items.push(item); }\n  getTotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }\n}', language: 'JavaScript', testabilityScore: 85, complexityScore: 12, qualityScore: 78, status: 'completed', projectId: projects[0].id, userId },
      { title: 'Transaction Handler', code: 'async def process_transaction(tx_data):\n    validate(tx_data)\n    result = await bank_api.transfer(tx_data)\n    await db.log_transaction(result)\n    return result', language: 'Python', testabilityScore: 72, complexityScore: 18, qualityScore: 81, status: 'completed', projectId: projects[1].id, userId },
      { title: 'Patient Scheduler', code: 'function scheduleAppointment(patientId, doctorId, dateTime) {\n  const conflicts = checkConflicts(doctorId, dateTime);\n  if (conflicts.length) throw new ConflictError(conflicts);\n  return createAppointment({ patientId, doctorId, dateTime });\n}', language: 'TypeScript', testabilityScore: 90, complexityScore: 8, qualityScore: 92, status: 'completed', projectId: projects[2].id, userId },
      { title: 'Stock Calculator', code: 'public class StockCalculator {\n  public BigDecimal calculateReorderPoint(Product p) {\n    return p.getDailyUsage().multiply(p.getLeadTime()).add(p.getSafetyStock());\n  }\n}', language: 'Java', testabilityScore: 95, complexityScore: 5, qualityScore: 88, status: 'completed', projectId: projects[3].id, userId },
      { title: 'Analytics Aggregator', code: 'const aggregateMetrics = (posts) => {\n  return posts.reduce((acc, post) => ({\n    totalLikes: acc.totalLikes + post.likes,\n    totalShares: acc.totalShares + post.shares,\n    avgEngagement: (acc.totalEngagement + post.engagement) / posts.length\n  }), { totalLikes: 0, totalShares: 0, totalEngagement: 0 });\n};', language: 'TypeScript', testabilityScore: 88, complexityScore: 10, qualityScore: 75, status: 'completed', projectId: projects[4].id, userId },
      { title: 'Data Preprocessor', code: 'def preprocess(data):\n    data = data.dropna()\n    data = normalize(data)\n    data = encode_categorical(data)\n    return train_test_split(data)', language: 'Python', testabilityScore: 65, complexityScore: 22, qualityScore: 70, status: 'completed', projectId: projects[5].id, userId },
      { title: 'MQTT Handler', code: 'func HandleMessage(msg mqtt.Message) error {\n  var reading SensorReading\n  if err := json.Unmarshal(msg.Payload(), &reading); err != nil { return err }\n  return store.Save(reading)\n}', language: 'Go', testabilityScore: 82, complexityScore: 7, qualityScore: 85, status: 'completed', projectId: projects[6].id, userId },
      { title: 'Contact Manager', code: 'class ContactManager {\n  async merge(primary, duplicate) {\n    const merged = { ...duplicate, ...primary };\n    await this.db.update(primary.id, merged);\n    await this.db.delete(duplicate.id);\n    await this.audit.log("merge", primary.id, duplicate.id);\n    return merged;\n  }\n}', language: 'JavaScript', testabilityScore: 75, complexityScore: 15, qualityScore: 72, status: 'completed', projectId: projects[7].id, userId },
      { title: 'Refund Processor', code: '@Service\npublic class RefundService {\n  @Transactional\n  public RefundResult processRefund(String txId, BigDecimal amount) {\n    Transaction tx = txRepo.findById(txId).orElseThrow();\n    if (amount.compareTo(tx.getAmount()) > 0) throw new InvalidAmountException();\n    return gateway.refund(tx, amount);\n  }\n}', language: 'Java', testabilityScore: 80, complexityScore: 14, qualityScore: 86, status: 'completed', projectId: projects[8].id, userId },
      { title: 'Content Validator', code: 'async function validateContent(content) {\n  const schema = getSchema(content.type);\n  const errors = schema.validate(content.body);\n  if (errors.length) return { valid: false, errors };\n  const sanitized = sanitizeHtml(content.body);\n  return { valid: true, body: sanitized };\n}', language: 'TypeScript', testabilityScore: 91, complexityScore: 9, qualityScore: 89, status: 'completed', projectId: projects[9].id, userId },
      { title: 'Template Engine', code: 'def render_template(name, context):\n    template = load_template(name)\n    for key, value in context.items():\n        template = template.replace(f"{{{{{key}}}}}", str(value))\n    return template', language: 'Python', testabilityScore: 70, complexityScore: 11, qualityScore: 65, status: 'completed', projectId: projects[10].id, userId },
      { title: 'Index Builder', code: 'func BuildIndex(docs []Document) (*Index, error) {\n  idx := NewIndex()\n  for _, doc := range docs {\n    tokens := Tokenize(doc.Content)\n    for _, token := range tokens { idx.Add(token, doc.ID) }\n  }\n  return idx, nil\n}', language: 'Go', testabilityScore: 87, complexityScore: 13, qualityScore: 83, status: 'completed', projectId: projects[11].id, userId },
      { title: 'Session Manager', code: 'class SessionManager {\n  async createSession(userId) {\n    const token = crypto.randomBytes(32).toString("hex");\n    await redis.set(`session:${token}`, userId, "EX", 3600);\n    return token;\n  }\n  async validateSession(token) {\n    return redis.get(`session:${token}`);\n  }\n}', language: 'TypeScript', testabilityScore: 78, complexityScore: 8, qualityScore: 82, status: 'completed', projectId: projects[12].id, userId },
      { title: 'Chunk Uploader', code: 'async fn upload_chunk(file_id: &str, chunk: &[u8], offset: u64) -> Result<()> {\n  let mut file = storage.open(file_id).await?;\n  file.seek(SeekFrom::Start(offset)).await?;\n  file.write_all(chunk).await?;\n  Ok(())\n}', language: 'Rust', testabilityScore: 74, complexityScore: 16, qualityScore: 79, status: 'completed', projectId: projects[13].id, userId },
      { title: 'Message Router', code: 'function routeMessage(socket, message) {\n  const room = rooms.get(message.roomId);\n  if (!room) return socket.emit("error", "Room not found");\n  room.members.forEach(member => {\n    if (member.id !== socket.userId) member.socket.emit("message", message);\n  });\n}', language: 'JavaScript', testabilityScore: 68, complexityScore: 12, qualityScore: 71, status: 'completed', projectId: projects[14].id, userId }
    ]);

    // Seed Bug Detection (15 items)
    await BugDetection.bulkCreate([
      { title: 'XSS in Product Search', code: 'document.getElementById("results").innerHTML = userInput;', language: 'JavaScript', bugsFound: 3, severity: 'critical', status: 'completed', projectId: projects[0].id, userId },
      { title: 'SQL Injection in Login', code: 'query = f"SELECT * FROM users WHERE email=\'{email}\' AND password=\'{password}\'"', language: 'Python', bugsFound: 2, severity: 'critical', status: 'completed', projectId: projects[1].id, userId },
      { title: 'Race Condition in Booking', code: 'const slot = await getSlot(id);\nif (slot.available) { await bookSlot(id, patientId); }', language: 'TypeScript', bugsFound: 1, severity: 'high', status: 'completed', projectId: projects[2].id, userId },
      { title: 'Integer Overflow in Count', code: 'public int getTotalStock() { int total = 0; for (Product p : products) total += p.getStock(); return total; }', language: 'Java', bugsFound: 1, severity: 'medium', status: 'completed', projectId: projects[3].id, userId },
      { title: 'Memory Leak in Dashboard', code: 'useEffect(() => { const interval = setInterval(fetchData, 5000); }, []);', language: 'TypeScript', bugsFound: 2, severity: 'high', status: 'completed', projectId: projects[4].id, userId },
      { title: 'Null Reference in Pipeline', code: 'result = model.predict(data)\naccuracy = result.metrics.accuracy', language: 'Python', bugsFound: 1, severity: 'medium', status: 'completed', projectId: projects[5].id, userId },
      { title: 'Buffer Overflow in Parser', code: 'buf := make([]byte, 1024)\nn, _ := conn.Read(buf)', language: 'Go', bugsFound: 2, severity: 'high', status: 'completed', projectId: projects[6].id, userId },
      { title: 'Deadlock in Contact Merge', code: 'async merge(a, b) {\n  await lockRecord(a.id);\n  await lockRecord(b.id);\n  // potential deadlock if called with reversed args\n}', language: 'JavaScript', bugsFound: 1, severity: 'high', status: 'completed', projectId: projects[7].id, userId },
      { title: 'Double Charge Bug', code: 'if (retryCount < 3) { chargeCard(amount); retryCount++; }', language: 'Java', bugsFound: 1, severity: 'critical', status: 'completed', projectId: projects[8].id, userId },
      { title: 'Cache Invalidation Issue', code: 'function updateArticle(id, data) {\n  db.update(id, data);\n  // cache not invalidated\n  return getArticle(id);\n}', language: 'TypeScript', bugsFound: 1, severity: 'medium', status: 'completed', projectId: projects[9].id, userId },
      { title: 'Email Injection', code: 'headers = f"From: {sender}\\r\\nTo: {recipient}\\r\\nSubject: {subject}"', language: 'Python', bugsFound: 2, severity: 'high', status: 'completed', projectId: projects[10].id, userId },
      { title: 'Goroutine Leak', code: 'func search(queries []string) {\n  for _, q := range queries {\n    go func() { results <- doSearch(q) }()\n  }\n}', language: 'Go', bugsFound: 2, severity: 'high', status: 'completed', projectId: projects[11].id, userId },
      { title: 'Token Expiry Bypass', code: 'const isValid = token.exp > Date.now;  // missing () on Date.now', language: 'TypeScript', bugsFound: 1, severity: 'critical', status: 'completed', projectId: projects[12].id, userId },
      { title: 'Path Traversal', code: 'let path = format!("/uploads/{}", user_input);\nfs::read(path)?', language: 'Rust', bugsFound: 1, severity: 'critical', status: 'completed', projectId: projects[13].id, userId },
      { title: 'WebSocket Memory Leak', code: 'socket.on("message", (data) => {\n  messages.push(data);  // unbounded array growth\n});', language: 'JavaScript', bugsFound: 1, severity: 'high', status: 'completed', projectId: projects[14].id, userId }
    ]);

    // Seed Coverage Analysis (15 items)
    await CoverageAnalysis.bulkCreate([
      { title: 'E-Commerce Coverage Q1', projectName: 'E-Commerce Platform', totalLines: 12500, coveredLines: 10625, coveragePercent: 85.0, branchCoverage: 78.5, functionCoverage: 92.0, status: 'completed', projectId: projects[0].id, userId },
      { title: 'Banking API Coverage', projectName: 'Mobile Banking API', totalLines: 8900, coveredLines: 8010, coveragePercent: 90.0, branchCoverage: 85.2, functionCoverage: 95.5, status: 'completed', projectId: projects[1].id, userId },
      { title: 'Healthcare Portal Coverage', projectName: 'Healthcare Portal', totalLines: 15200, coveredLines: 11400, coveragePercent: 75.0, branchCoverage: 68.3, functionCoverage: 82.1, status: 'completed', projectId: projects[2].id, userId },
      { title: 'Inventory System Coverage', projectName: 'Inventory Management', totalLines: 6800, coveredLines: 6120, coveragePercent: 90.0, branchCoverage: 87.0, functionCoverage: 94.5, status: 'completed', projectId: projects[3].id, userId },
      { title: 'Dashboard Coverage', projectName: 'Social Media Dashboard', totalLines: 9500, coveredLines: 7125, coveragePercent: 75.0, branchCoverage: 65.8, functionCoverage: 80.2, status: 'completed', projectId: projects[4].id, userId },
      { title: 'ML Pipeline Coverage', projectName: 'ML Pipeline Service', totalLines: 5600, coveredLines: 3920, coveragePercent: 70.0, branchCoverage: 62.5, functionCoverage: 78.0, status: 'completed', projectId: projects[5].id, userId },
      { title: 'IoT Gateway Coverage', projectName: 'IoT Gateway', totalLines: 4200, coveredLines: 3570, coveragePercent: 85.0, branchCoverage: 80.0, functionCoverage: 90.0, status: 'completed', projectId: projects[6].id, userId },
      { title: 'CRM System Coverage', projectName: 'CRM System', totalLines: 18000, coveredLines: 12600, coveragePercent: 70.0, branchCoverage: 63.5, functionCoverage: 76.8, status: 'completed', projectId: projects[7].id, userId },
      { title: 'Payment Coverage', projectName: 'Payment Gateway', totalLines: 7500, coveredLines: 7125, coveragePercent: 95.0, branchCoverage: 92.0, functionCoverage: 98.0, status: 'completed', projectId: projects[8].id, userId },
      { title: 'CMS Coverage', projectName: 'Content Management', totalLines: 11000, coveredLines: 8800, coveragePercent: 80.0, branchCoverage: 74.0, functionCoverage: 86.5, status: 'completed', projectId: projects[9].id, userId },
      { title: 'Notification Coverage', projectName: 'Notification Service', totalLines: 6200, coveredLines: 4960, coveragePercent: 80.0, branchCoverage: 72.5, functionCoverage: 85.0, status: 'completed', projectId: projects[10].id, userId },
      { title: 'Search Engine Coverage', projectName: 'Search Engine', totalLines: 3800, coveredLines: 3230, coveragePercent: 85.0, branchCoverage: 79.0, functionCoverage: 91.0, status: 'completed', projectId: projects[11].id, userId },
      { title: 'Auth Service Coverage', projectName: 'Auth Microservice', totalLines: 5100, coveredLines: 4845, coveragePercent: 95.0, branchCoverage: 91.5, functionCoverage: 97.0, status: 'completed', projectId: projects[12].id, userId },
      { title: 'Storage Coverage', projectName: 'File Storage Service', totalLines: 4500, coveredLines: 3375, coveragePercent: 75.0, branchCoverage: 68.0, functionCoverage: 80.5, status: 'completed', projectId: projects[13].id, userId },
      { title: 'Chat App Coverage', projectName: 'Real-time Chat', totalLines: 7200, coveredLines: 5040, coveragePercent: 70.0, branchCoverage: 60.0, functionCoverage: 75.0, status: 'completed', projectId: projects[14].id, userId }
    ]);

    // Seed Test Templates (15 items)
    await TestTemplate.bulkCreate([
      { name: 'Jest Unit Test', description: 'Basic Jest unit test template', language: 'JavaScript', framework: 'Jest', category: 'Unit Test', templateCode: 'describe("ModuleName", () => {\n  test("should do something", () => {\n    const result = functionToTest(input);\n    expect(result).toBe(expected);\n  });\n});', isPublic: true, usageCount: 234, userId },
      { name: 'Pytest Fixture', description: 'Pytest test with fixtures', language: 'Python', framework: 'pytest', category: 'Unit Test', templateCode: 'import pytest\n\n@pytest.fixture\ndef setup_data():\n    return {"key": "value"}\n\ndef test_function(setup_data):\n    result = function_to_test(setup_data)\n    assert result is not None', isPublic: true, usageCount: 189, userId },
      { name: 'JUnit 5 Test', description: 'JUnit 5 parameterized test template', language: 'Java', framework: 'JUnit 5', category: 'Unit Test', templateCode: '@ParameterizedTest\n@ValueSource(strings = {"test1", "test2"})\nvoid testMethod(String input) {\n  assertNotNull(service.process(input));\n}', isPublic: true, usageCount: 156, userId },
      { name: 'React Component Test', description: 'React Testing Library component test', language: 'TypeScript', framework: 'RTL', category: 'Component Test', templateCode: 'import { render, screen } from "@testing-library/react";\n\ntest("renders component", () => {\n  render(<Component />);\n  expect(screen.getByText("Hello")).toBeInTheDocument();\n});', isPublic: true, usageCount: 312, userId },
      { name: 'Go Table Test', description: 'Go table-driven test template', language: 'Go', framework: 'testing', category: 'Unit Test', templateCode: 'func TestFunction(t *testing.T) {\n  tests := []struct{ name string; input int; want int }{\n    {"case1", 1, 2},\n  }\n  for _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n      if got := Function(tt.input); got != tt.want { t.Errorf("got %d, want %d", got, tt.want) }\n    })\n  }\n}', isPublic: true, usageCount: 98, userId },
      { name: 'API Integration Test', description: 'Supertest API integration test', language: 'JavaScript', framework: 'Supertest', category: 'Integration Test', templateCode: 'const request = require("supertest");\nconst app = require("../app");\n\ndescribe("GET /api/resource", () => {\n  it("returns 200", async () => {\n    const res = await request(app).get("/api/resource");\n    expect(res.status).toBe(200);\n  });\n});', isPublic: true, usageCount: 267, userId },
      { name: 'Cypress E2E Test', description: 'Cypress end-to-end test template', language: 'JavaScript', framework: 'Cypress', category: 'E2E Test', templateCode: 'describe("User Flow", () => {\n  it("should complete workflow", () => {\n    cy.visit("/");\n    cy.get("[data-testid=button]").click();\n    cy.url().should("include", "/dashboard");\n  });\n});', isPublic: true, usageCount: 201, userId },
      { name: 'Mocha Async Test', description: 'Mocha async/await test template', language: 'JavaScript', framework: 'Mocha', category: 'Unit Test', templateCode: 'describe("AsyncService", () => {\n  it("should fetch data", async () => {\n    const result = await service.fetchData();\n    expect(result).to.have.property("data");\n  });\n});', isPublic: true, usageCount: 145, userId },
      { name: 'Django Test Case', description: 'Django TestCase template', language: 'Python', framework: 'Django', category: 'Integration Test', templateCode: 'from django.test import TestCase\n\nclass ModelTest(TestCase):\n  def setUp(self):\n    self.obj = Model.objects.create(name="test")\n\n  def test_creation(self):\n    self.assertEqual(self.obj.name, "test")', isPublic: true, usageCount: 132, userId },
      { name: 'Spring Boot Test', description: 'Spring Boot integration test', language: 'Java', framework: 'Spring Boot', category: 'Integration Test', templateCode: '@SpringBootTest\n@AutoConfigureMockMvc\nclass ControllerTest {\n  @Autowired MockMvc mockMvc;\n\n  @Test\n  void testEndpoint() throws Exception {\n    mockMvc.perform(get("/api/resource")).andExpect(status().isOk());\n  }\n}', isPublic: true, usageCount: 178, userId },
      { name: 'Rust Unit Test', description: 'Rust unit test template', language: 'Rust', framework: 'cargo test', category: 'Unit Test', templateCode: '#[cfg(test)]\nmod tests {\n  use super::*;\n\n  #[test]\n  fn test_function() {\n    assert_eq!(function(input), expected);\n  }\n}', isPublic: true, usageCount: 67, userId },
      { name: 'Vue Component Test', description: 'Vue Test Utils component test', language: 'TypeScript', framework: 'Vitest', category: 'Component Test', templateCode: 'import { mount } from "@vue/test-utils";\n\ntest("renders", () => {\n  const wrapper = mount(Component);\n  expect(wrapper.text()).toContain("Hello");\n});', isPublic: true, usageCount: 89, userId },
      { name: 'Playwright E2E', description: 'Playwright browser test template', language: 'TypeScript', framework: 'Playwright', category: 'E2E Test', templateCode: 'import { test, expect } from "@playwright/test";\n\ntest("page loads", async ({ page }) => {\n  await page.goto("/");\n  await expect(page.locator("h1")).toBeVisible();\n});', isPublic: true, usageCount: 156, userId },
      { name: 'Load Test k6', description: 'k6 load test template', language: 'JavaScript', framework: 'k6', category: 'Performance Test', templateCode: 'import http from "k6/http";\nimport { check } from "k6";\n\nexport const options = { vus: 10, duration: "30s" };\n\nexport default function () {\n  const res = http.get("http://localhost:3000/api");\n  check(res, { "status 200": (r) => r.status === 200 });\n}', isPublic: true, usageCount: 112, userId },
      { name: 'Mock Service Worker', description: 'MSW API mock template', language: 'TypeScript', framework: 'MSW', category: 'Mock', templateCode: 'import { rest } from "msw";\nimport { setupServer } from "msw/node";\n\nconst server = setupServer(\n  rest.get("/api/data", (req, res, ctx) => {\n    return res(ctx.json({ data: [] }));\n  })\n);\n\nbeforeAll(() => server.listen());\nafterAll(() => server.close());', isPublic: true, usageCount: 203, userId }
    ]);

    // Seed Teams (15 items)
    await Team.bulkCreate([
      { name: 'Frontend Engineering', description: 'React/Vue frontend development team', memberCount: 8, role: 'Development', email: 'frontend@testgen.ai', status: 'active', userId },
      { name: 'Backend Engineering', description: 'API and microservices development', memberCount: 12, role: 'Development', email: 'backend@testgen.ai', status: 'active', userId },
      { name: 'QA Automation', description: 'Test automation and quality assurance', memberCount: 6, role: 'Testing', email: 'qa@testgen.ai', status: 'active', userId },
      { name: 'DevOps', description: 'Infrastructure and CI/CD pipeline management', memberCount: 4, role: 'Operations', email: 'devops@testgen.ai', status: 'active', userId },
      { name: 'Security Team', description: 'Application security and penetration testing', memberCount: 3, role: 'Security', email: 'security@testgen.ai', status: 'active', userId },
      { name: 'Mobile Development', description: 'iOS and Android app development', memberCount: 7, role: 'Development', email: 'mobile@testgen.ai', status: 'active', userId },
      { name: 'Data Engineering', description: 'Data pipeline and analytics team', memberCount: 5, role: 'Data', email: 'data@testgen.ai', status: 'active', userId },
      { name: 'Platform Team', description: 'Core platform and infrastructure', memberCount: 6, role: 'Platform', email: 'platform@testgen.ai', status: 'active', userId },
      { name: 'Product Management', description: 'Product strategy and roadmap', memberCount: 4, role: 'Product', email: 'product@testgen.ai', status: 'active', userId },
      { name: 'UX Design', description: 'User experience and interface design', memberCount: 3, role: 'Design', email: 'ux@testgen.ai', status: 'active', userId },
      { name: 'Release Engineering', description: 'Release management and deployment', memberCount: 2, role: 'Operations', email: 'release@testgen.ai', status: 'active', userId },
      { name: 'Performance Team', description: 'Performance testing and optimization', memberCount: 3, role: 'Testing', email: 'perf@testgen.ai', status: 'active', userId },
      { name: 'Documentation', description: 'Technical documentation and API docs', memberCount: 2, role: 'Documentation', email: 'docs@testgen.ai', status: 'active', userId },
      { name: 'SRE Team', description: 'Site reliability and monitoring', memberCount: 4, role: 'Operations', email: 'sre@testgen.ai', status: 'active', userId },
      { name: 'AI/ML Team', description: 'Machine learning and AI features', memberCount: 5, role: 'Research', email: 'ml@testgen.ai', status: 'active', userId }
    ]);

    // Seed Test Executions (15 items)
    await TestExecution.bulkCreate([
      { name: 'Nightly Build #1247', suiteName: 'E-Commerce Unit Tests', totalTests: 145, passed: 138, failed: 7, skipped: 0, duration: 45.2, status: 'completed', environment: 'staging', projectId: projects[0].id, userId },
      { name: 'PR #892 Validation', suiteName: 'Banking API Integration', totalTests: 89, passed: 87, failed: 2, skipped: 0, duration: 120.5, status: 'completed', environment: 'CI', projectId: projects[1].id, userId },
      { name: 'Release v2.3.0 Tests', suiteName: 'Healthcare E2E Suite', totalTests: 67, passed: 65, failed: 1, skipped: 1, duration: 340.8, status: 'completed', environment: 'pre-production', projectId: projects[2].id, userId },
      { name: 'Smoke Test Run', suiteName: 'Inventory Smoke Tests', totalTests: 32, passed: 32, failed: 0, skipped: 0, duration: 12.3, status: 'completed', environment: 'production', projectId: projects[3].id, userId },
      { name: 'Component Test Run', suiteName: 'Dashboard Component Tests', totalTests: 78, passed: 72, failed: 6, skipped: 0, duration: 28.6, status: 'completed', environment: 'CI', projectId: projects[4].id, userId },
      { name: 'Model Validation #56', suiteName: 'ML Pipeline Validation', totalTests: 45, passed: 43, failed: 2, skipped: 0, duration: 180.4, status: 'completed', environment: 'gpu-cluster', projectId: projects[5].id, userId },
      { name: 'Protocol Test Suite', suiteName: 'IoT Protocol Tests', totalTests: 56, passed: 54, failed: 0, skipped: 2, duration: 67.9, status: 'completed', environment: 'lab', projectId: projects[6].id, userId },
      { name: 'Weekly Regression', suiteName: 'CRM Regression Suite', totalTests: 120, passed: 115, failed: 5, skipped: 0, duration: 250.3, status: 'completed', environment: 'staging', projectId: projects[7].id, userId },
      { name: 'Security Scan #34', suiteName: 'Payment Security Tests', totalTests: 95, passed: 93, failed: 2, skipped: 0, duration: 156.7, status: 'completed', environment: 'security-sandbox', projectId: projects[8].id, userId },
      { name: 'Content Migration Test', suiteName: 'CMS Content Tests', totalTests: 58, passed: 58, failed: 0, skipped: 0, duration: 89.1, status: 'completed', environment: 'staging', projectId: projects[9].id, userId },
      { name: 'Delivery Test Run', suiteName: 'Notification Delivery Tests', totalTests: 73, passed: 70, failed: 3, skipped: 0, duration: 95.6, status: 'completed', environment: 'CI', projectId: projects[10].id, userId },
      { name: 'Search Quality Check', suiteName: 'Search Accuracy Tests', totalTests: 42, passed: 40, failed: 2, skipped: 0, duration: 45.3, status: 'completed', environment: 'staging', projectId: projects[11].id, userId },
      { name: 'Auth Flow #128', suiteName: 'Auth Flow Tests', totalTests: 88, passed: 86, failed: 2, skipped: 0, duration: 78.9, status: 'completed', environment: 'CI', projectId: projects[12].id, userId },
      { name: 'Load Test Results', suiteName: 'Storage Load Tests', totalTests: 35, passed: 30, failed: 5, skipped: 0, duration: 600.0, status: 'completed', environment: 'load-test', projectId: projects[13].id, userId },
      { name: 'WebSocket Test Run', suiteName: 'Chat WebSocket Tests', totalTests: 48, passed: 44, failed: 4, skipped: 0, duration: 55.2, status: 'running', environment: 'CI', projectId: projects[14].id, userId }
    ]);

    // Seed API Tests (15 items)
    await ApiTest.bulkCreate([
      { name: 'GET Products List', endpoint: '/api/products', method: 'GET', headers: '{"Accept": "application/json"}', expectedStatus: 200, status: 'passed', projectId: projects[0].id, userId },
      { name: 'POST Create Account', endpoint: '/api/accounts', method: 'POST', headers: '{"Content-Type": "application/json", "Authorization": "Bearer token"}', requestBody: '{"name": "Savings", "type": "savings", "initialDeposit": 1000}', expectedStatus: 201, status: 'passed', projectId: projects[1].id, userId },
      { name: 'GET Patient Records', endpoint: '/api/patients/:id/records', method: 'GET', headers: '{"Authorization": "Bearer token"}', expectedStatus: 200, status: 'active', projectId: projects[2].id, userId },
      { name: 'PUT Update Inventory', endpoint: '/api/inventory/:sku', method: 'PUT', headers: '{"Content-Type": "application/json"}', requestBody: '{"quantity": 150, "location": "warehouse-A"}', expectedStatus: 200, status: 'passed', projectId: projects[3].id, userId },
      { name: 'GET Dashboard Metrics', endpoint: '/api/analytics/metrics', method: 'GET', headers: '{"Authorization": "Bearer token"}', expectedStatus: 200, status: 'active', projectId: projects[4].id, userId },
      { name: 'POST Train Model', endpoint: '/api/models/train', method: 'POST', headers: '{"Content-Type": "application/json"}', requestBody: '{"modelType": "classification", "dataset": "training-v2"}', expectedStatus: 202, status: 'draft', projectId: projects[5].id, userId },
      { name: 'POST Sensor Data', endpoint: '/api/sensors/data', method: 'POST', headers: '{"Content-Type": "application/json", "X-Device-Id": "sensor-001"}', requestBody: '{"temperature": 22.5, "humidity": 65.0, "timestamp": "2024-01-15T10:00:00Z"}', expectedStatus: 201, status: 'passed', projectId: projects[6].id, userId },
      { name: 'GET Contact Search', endpoint: '/api/contacts/search?q=john', method: 'GET', headers: '{"Authorization": "Bearer token"}', expectedStatus: 200, status: 'active', projectId: projects[7].id, userId },
      { name: 'POST Process Payment', endpoint: '/api/payments/charge', method: 'POST', headers: '{"Content-Type": "application/json", "Idempotency-Key": "uuid"}', requestBody: '{"amount": 99.99, "currency": "USD", "cardToken": "tok_visa"}', expectedStatus: 200, status: 'passed', projectId: projects[8].id, userId },
      { name: 'POST Create Article', endpoint: '/api/articles', method: 'POST', headers: '{"Content-Type": "application/json", "Authorization": "Bearer token"}', requestBody: '{"title": "Test Article", "content": "Body content", "status": "draft"}', expectedStatus: 201, status: 'active', projectId: projects[9].id, userId },
      { name: 'POST Send Notification', endpoint: '/api/notifications/send', method: 'POST', headers: '{"Content-Type": "application/json"}', requestBody: '{"userId": 1, "channel": "email", "template": "welcome"}', expectedStatus: 200, status: 'passed', projectId: projects[10].id, userId },
      { name: 'GET Search Results', endpoint: '/api/search?q=test&limit=10', method: 'GET', headers: '{"Accept": "application/json"}', expectedStatus: 200, status: 'active', projectId: projects[11].id, userId },
      { name: 'POST OAuth Token', endpoint: '/api/auth/token', method: 'POST', headers: '{"Content-Type": "application/x-www-form-urlencoded"}', requestBody: '{"grant_type": "authorization_code", "code": "auth_code"}', expectedStatus: 200, status: 'passed', projectId: projects[12].id, userId },
      { name: 'DELETE Remove File', endpoint: '/api/files/:fileId', method: 'DELETE', headers: '{"Authorization": "Bearer token"}', expectedStatus: 204, status: 'draft', projectId: projects[13].id, userId },
      { name: 'GET Room Messages', endpoint: '/api/rooms/:roomId/messages', method: 'GET', headers: '{"Authorization": "Bearer token"}', expectedStatus: 200, status: 'active', projectId: projects[14].id, userId }
    ]);

    // Seed Performance Tests (15 items)
    await PerformanceTest.bulkCreate([
      { name: 'Product Page Load Test', targetUrl: 'https://ecommerce.example.com/products', testType: 'load', virtualUsers: 100, duration: 300, avgResponseTime: 245, maxResponseTime: 1200, throughput: 450, errorRate: 0.5, status: 'completed', projectId: projects[0].id, userId },
      { name: 'Transaction API Stress', targetUrl: 'https://banking-api.example.com/transfer', testType: 'stress', virtualUsers: 500, duration: 600, avgResponseTime: 890, maxResponseTime: 5000, throughput: 120, errorRate: 2.3, status: 'completed', projectId: projects[1].id, userId },
      { name: 'Appointment Booking Spike', targetUrl: 'https://healthcare.example.com/book', testType: 'spike', virtualUsers: 1000, duration: 120, avgResponseTime: 1500, maxResponseTime: 8000, throughput: 80, errorRate: 5.1, status: 'completed', projectId: projects[2].id, userId },
      { name: 'Inventory Search Load', targetUrl: 'https://inventory.example.com/search', testType: 'load', virtualUsers: 200, duration: 300, avgResponseTime: 180, maxResponseTime: 800, throughput: 600, errorRate: 0.2, status: 'completed', projectId: projects[3].id, userId },
      { name: 'Dashboard Render Test', targetUrl: 'https://dashboard.example.com', testType: 'load', virtualUsers: 50, duration: 180, avgResponseTime: 320, maxResponseTime: 1500, throughput: 300, errorRate: 0.8, status: 'completed', projectId: projects[4].id, userId },
      { name: 'Model Inference Benchmark', targetUrl: 'https://ml.example.com/predict', testType: 'endurance', virtualUsers: 30, duration: 3600, avgResponseTime: 450, maxResponseTime: 2000, throughput: 65, errorRate: 0.1, status: 'completed', projectId: projects[5].id, userId },
      { name: 'IoT Data Ingestion', targetUrl: 'https://iot.example.com/ingest', testType: 'stress', virtualUsers: 10000, duration: 600, avgResponseTime: 50, maxResponseTime: 500, throughput: 5000, errorRate: 1.2, status: 'completed', projectId: projects[6].id, userId },
      { name: 'CRM Page Load', targetUrl: 'https://crm.example.com/contacts', testType: 'load', virtualUsers: 150, duration: 300, avgResponseTime: 380, maxResponseTime: 2100, throughput: 250, errorRate: 1.5, status: 'completed', projectId: projects[7].id, userId },
      { name: 'Payment Checkout Flow', targetUrl: 'https://payments.example.com/checkout', testType: 'load', virtualUsers: 200, duration: 300, avgResponseTime: 560, maxResponseTime: 3000, throughput: 180, errorRate: 0.3, status: 'completed', projectId: projects[8].id, userId },
      { name: 'CMS GraphQL Query', targetUrl: 'https://cms.example.com/graphql', testType: 'load', virtualUsers: 100, duration: 300, avgResponseTime: 210, maxResponseTime: 900, throughput: 400, errorRate: 0.4, status: 'completed', projectId: projects[9].id, userId },
      { name: 'Notification Throughput', targetUrl: 'https://notify.example.com/send', testType: 'stress', virtualUsers: 1000, duration: 600, avgResponseTime: 120, maxResponseTime: 800, throughput: 2000, errorRate: 0.8, status: 'completed', projectId: projects[10].id, userId },
      { name: 'Search Latency Test', targetUrl: 'https://search.example.com/query', testType: 'load', virtualUsers: 300, duration: 300, avgResponseTime: 95, maxResponseTime: 450, throughput: 1500, errorRate: 0.1, status: 'completed', projectId: projects[11].id, userId },
      { name: 'Auth Token Issuance', targetUrl: 'https://auth.example.com/token', testType: 'spike', virtualUsers: 2000, duration: 60, avgResponseTime: 200, maxResponseTime: 1500, throughput: 800, errorRate: 1.8, status: 'completed', projectId: projects[12].id, userId },
      { name: 'File Upload Stress', targetUrl: 'https://storage.example.com/upload', testType: 'stress', virtualUsers: 50, duration: 600, avgResponseTime: 2500, maxResponseTime: 15000, throughput: 20, errorRate: 3.5, status: 'completed', projectId: projects[13].id, userId },
      { name: 'WebSocket Connections', targetUrl: 'wss://chat.example.com/ws', testType: 'endurance', virtualUsers: 5000, duration: 7200, avgResponseTime: 15, maxResponseTime: 200, throughput: 10000, errorRate: 0.5, status: 'completed', projectId: projects[14].id, userId }
    ]);

    // Seed Security Tests (15 items)
    await SecurityTest.bulkCreate([
      { name: 'E-Commerce XSS Scan', targetUrl: 'https://ecommerce.example.com', scanType: 'full', vulnerabilitiesFound: 5, criticalCount: 1, highCount: 2, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[0].id, userId },
      { name: 'Banking API Auth Test', targetUrl: 'https://banking-api.example.com', scanType: 'auth', vulnerabilitiesFound: 2, criticalCount: 0, highCount: 1, mediumCount: 1, lowCount: 0, status: 'completed', projectId: projects[1].id, userId },
      { name: 'Healthcare HIPAA Scan', targetUrl: 'https://healthcare.example.com', scanType: 'full', vulnerabilitiesFound: 8, criticalCount: 2, highCount: 3, mediumCount: 2, lowCount: 1, status: 'completed', projectId: projects[2].id, userId },
      { name: 'Inventory SQL Injection', targetUrl: 'https://inventory.example.com', scanType: 'quick', vulnerabilitiesFound: 1, criticalCount: 0, highCount: 0, mediumCount: 1, lowCount: 0, status: 'completed', projectId: projects[3].id, userId },
      { name: 'Dashboard CSRF Check', targetUrl: 'https://dashboard.example.com', scanType: 'quick', vulnerabilitiesFound: 3, criticalCount: 0, highCount: 1, mediumCount: 2, lowCount: 0, status: 'completed', projectId: projects[4].id, userId },
      { name: 'ML API Security Scan', targetUrl: 'https://ml.example.com', scanType: 'api', vulnerabilitiesFound: 4, criticalCount: 0, highCount: 2, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[5].id, userId },
      { name: 'IoT Firmware Scan', targetUrl: 'https://iot.example.com', scanType: 'full', vulnerabilitiesFound: 6, criticalCount: 1, highCount: 2, mediumCount: 2, lowCount: 1, status: 'completed', projectId: projects[6].id, userId },
      { name: 'CRM Data Exposure', targetUrl: 'https://crm.example.com', scanType: 'full', vulnerabilitiesFound: 3, criticalCount: 0, highCount: 1, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[7].id, userId },
      { name: 'Payment PCI Compliance', targetUrl: 'https://payments.example.com', scanType: 'full', vulnerabilitiesFound: 2, criticalCount: 0, highCount: 1, mediumCount: 1, lowCount: 0, status: 'completed', projectId: projects[8].id, userId },
      { name: 'CMS Content Injection', targetUrl: 'https://cms.example.com', scanType: 'quick', vulnerabilitiesFound: 4, criticalCount: 1, highCount: 1, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[9].id, userId },
      { name: 'Notification SSRF Test', targetUrl: 'https://notify.example.com', scanType: 'api', vulnerabilitiesFound: 2, criticalCount: 0, highCount: 1, mediumCount: 1, lowCount: 0, status: 'completed', projectId: projects[10].id, userId },
      { name: 'Search Input Validation', targetUrl: 'https://search.example.com', scanType: 'quick', vulnerabilitiesFound: 1, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 1, status: 'completed', projectId: projects[11].id, userId },
      { name: 'Auth Brute Force Test', targetUrl: 'https://auth.example.com', scanType: 'auth', vulnerabilitiesFound: 3, criticalCount: 1, highCount: 1, mediumCount: 1, lowCount: 0, status: 'completed', projectId: projects[12].id, userId },
      { name: 'Storage Access Control', targetUrl: 'https://storage.example.com', scanType: 'auth', vulnerabilitiesFound: 5, criticalCount: 1, highCount: 2, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[13].id, userId },
      { name: 'Chat WebSocket Security', targetUrl: 'wss://chat.example.com', scanType: 'full', vulnerabilitiesFound: 4, criticalCount: 0, highCount: 2, mediumCount: 1, lowCount: 1, status: 'completed', projectId: projects[14].id, userId }
    ]);

    // Seed Integration Tests (15 items)
    await IntegrationTest.bulkCreate([
      { name: 'Cart to Checkout Flow', description: 'Test full cart to checkout integration', components: 'Cart Service, Payment Service, Inventory Service', status: 'passed', projectId: projects[0].id, userId },
      { name: 'Transfer Between Accounts', description: 'Test money transfer between accounts', components: 'Account Service, Transaction Service, Notification Service', status: 'passed', projectId: projects[1].id, userId },
      { name: 'Patient Registration Flow', description: 'Test patient registration and record creation', components: 'Auth Service, Patient Service, Records Service', status: 'active', projectId: projects[2].id, userId },
      { name: 'Order Fulfillment', description: 'Test order to shipment integration', components: 'Order Service, Inventory Service, Shipping Service', status: 'passed', projectId: projects[3].id, userId },
      { name: 'Social Post Publishing', description: 'Test post creation to all platforms', components: 'Post Service, Media Service, Analytics Service', status: 'active', projectId: projects[4].id, userId },
      { name: 'Training to Deployment', description: 'Test ML model training to deployment pipeline', components: 'Data Service, Training Service, Deployment Service', status: 'draft', projectId: projects[5].id, userId },
      { name: 'Sensor to Dashboard', description: 'Test sensor data flow to dashboard display', components: 'Sensor Gateway, Data Pipeline, Dashboard API', status: 'passed', projectId: projects[6].id, userId },
      { name: 'Lead to Opportunity', description: 'Test lead conversion to opportunity', components: 'Lead Service, Contact Service, Opportunity Service', status: 'active', projectId: projects[7].id, userId },
      { name: 'Payment to Receipt', description: 'Test payment processing to receipt generation', components: 'Payment Gateway, Receipt Service, Email Service', status: 'passed', projectId: projects[8].id, userId },
      { name: 'Content Publish Flow', description: 'Test content creation to publication', components: 'Editor Service, Review Service, CDN Service', status: 'active', projectId: projects[9].id, userId },
      { name: 'Multi-Channel Delivery', description: 'Test notification across all channels', components: 'Email Service, SMS Service, Push Service', status: 'passed', projectId: projects[10].id, userId },
      { name: 'Index and Search', description: 'Test document indexing to search result', components: 'Crawler Service, Index Service, Query Service', status: 'active', projectId: projects[11].id, userId },
      { name: 'SSO Login Flow', description: 'Test single sign-on across services', components: 'Identity Provider, Service Provider, Session Service', status: 'passed', projectId: projects[12].id, userId },
      { name: 'Upload and Process', description: 'Test file upload to processing pipeline', components: 'Upload Service, Virus Scan, Thumbnail Service', status: 'draft', projectId: projects[13].id, userId },
      { name: 'Message Delivery', description: 'Test message sending to receipt', components: 'Message Service, WebSocket Server, Notification Service', status: 'active', projectId: projects[14].id, userId }
    ]);

    // Seed Regression Tests (15 items)
    await RegressionTest.bulkCreate([
      { name: 'Cart Price Regression', description: 'Verify cart pricing after discount engine update', changeDescription: 'Updated discount calculation algorithm', affectedAreas: 'Cart, Checkout, Price Display', riskLevel: 'high', status: 'passed', projectId: projects[0].id, userId },
      { name: 'Auth Flow Regression', description: 'Verify login after security patch', changeDescription: 'Updated bcrypt to v5, changed salt rounds', affectedAreas: 'Login, Registration, Password Reset', riskLevel: 'critical', status: 'passed', projectId: projects[1].id, userId },
      { name: 'Appointment Regression', description: 'Verify scheduling after timezone fix', changeDescription: 'Fixed timezone handling in appointment scheduler', affectedAreas: 'Scheduling, Calendar, Notifications', riskLevel: 'high', status: 'active', projectId: projects[2].id, userId },
      { name: 'Stock Count Regression', description: 'Verify stock counts after batch update fix', changeDescription: 'Fixed race condition in concurrent stock updates', affectedAreas: 'Stock Management, Order Processing', riskLevel: 'critical', status: 'passed', projectId: projects[3].id, userId },
      { name: 'Chart Render Regression', description: 'Verify charts after D3.js upgrade', changeDescription: 'Upgraded D3.js from v6 to v7', affectedAreas: 'Charts, Graphs, Export', riskLevel: 'medium', status: 'active', projectId: projects[4].id, userId },
      { name: 'Model Accuracy Regression', description: 'Verify model accuracy after retraining', changeDescription: 'Retrained classification model with new data', affectedAreas: 'Predictions, Recommendations', riskLevel: 'high', status: 'draft', projectId: projects[5].id, userId },
      { name: 'Protocol Regression', description: 'Verify MQTT after broker upgrade', changeDescription: 'Upgraded MQTT broker from v3.1.1 to v5.0', affectedAreas: 'Device Communication, Data Ingestion', riskLevel: 'high', status: 'passed', projectId: projects[6].id, userId },
      { name: 'Search Regression', description: 'Verify search after index rebuild', changeDescription: 'Rebuilt search index with new analyzer', affectedAreas: 'Contact Search, Full-text Search', riskLevel: 'medium', status: 'active', projectId: projects[7].id, userId },
      { name: 'Payment Flow Regression', description: 'Verify payments after gateway migration', changeDescription: 'Migrated from Stripe v2 to v3 API', affectedAreas: 'Checkout, Refunds, Subscriptions', riskLevel: 'critical', status: 'passed', projectId: projects[8].id, userId },
      { name: 'GraphQL Schema Regression', description: 'Verify queries after schema update', changeDescription: 'Added new fields and deprecated old ones', affectedAreas: 'API Queries, Mutations, Subscriptions', riskLevel: 'medium', status: 'active', projectId: projects[9].id, userId },
      { name: 'Email Template Regression', description: 'Verify emails after template engine update', changeDescription: 'Switched template engine from Handlebars to EJS', affectedAreas: 'Email Notifications, Templates', riskLevel: 'medium', status: 'passed', projectId: projects[10].id, userId },
      { name: 'Ranking Regression', description: 'Verify search ranking after algorithm change', changeDescription: 'Updated relevance scoring algorithm', affectedAreas: 'Search Results, Ranking, Suggestions', riskLevel: 'high', status: 'active', projectId: projects[11].id, userId },
      { name: 'Token Validation Regression', description: 'Verify auth after JWT library update', changeDescription: 'Updated jsonwebtoken library with security patch', affectedAreas: 'Token Generation, Validation, Refresh', riskLevel: 'critical', status: 'passed', projectId: projects[12].id, userId },
      { name: 'Upload Size Regression', description: 'Verify uploads after limit increase', changeDescription: 'Increased max upload size from 50MB to 200MB', affectedAreas: 'File Upload, Storage, Thumbnails', riskLevel: 'medium', status: 'draft', projectId: projects[13].id, userId },
      { name: 'Message Format Regression', description: 'Verify messages after protocol update', changeDescription: 'Updated message serialization format', affectedAreas: 'Message Sending, History, Search', riskLevel: 'high', status: 'active', projectId: projects[14].id, userId }
    ]);

    // Seed Reports (15 items)
    await Report.bulkCreate([
      { name: 'Q1 2024 Test Summary', type: 'summary', projectName: 'All Projects', totalTests: 1250, passed: 1180, failed: 70, coverage: 82.5, status: 'completed', userId },
      { name: 'E-Commerce Coverage Report', type: 'coverage', projectName: 'E-Commerce Platform', totalTests: 145, passed: 138, failed: 7, coverage: 85.0, status: 'completed', userId },
      { name: 'Banking Security Audit', type: 'security', projectName: 'Mobile Banking API', totalTests: 95, passed: 90, failed: 5, coverage: 90.0, status: 'completed', userId },
      { name: 'Healthcare Performance Report', type: 'performance', projectName: 'Healthcare Portal', totalTests: 35, passed: 30, failed: 5, coverage: 75.0, status: 'completed', userId },
      { name: 'Inventory Regression Report', type: 'regression', projectName: 'Inventory Management', totalTests: 120, passed: 118, failed: 2, coverage: 90.0, status: 'completed', userId },
      { name: 'Dashboard Test Summary', type: 'summary', projectName: 'Social Media Dashboard', totalTests: 78, passed: 72, failed: 6, coverage: 75.0, status: 'completed', userId },
      { name: 'ML Pipeline Quality Report', type: 'custom', projectName: 'ML Pipeline Service', totalTests: 45, passed: 43, failed: 2, coverage: 70.0, status: 'completed', userId },
      { name: 'IoT Coverage Analysis', type: 'coverage', projectName: 'IoT Gateway', totalTests: 56, passed: 54, failed: 2, coverage: 85.0, status: 'completed', userId },
      { name: 'CRM Monthly Report', type: 'summary', projectName: 'CRM System', totalTests: 120, passed: 115, failed: 5, coverage: 70.0, status: 'completed', userId },
      { name: 'Payment Security Report', type: 'security', projectName: 'Payment Gateway', totalTests: 95, passed: 93, failed: 2, coverage: 95.0, status: 'completed', userId },
      { name: 'CMS Performance Report', type: 'performance', projectName: 'Content Management', totalTests: 40, passed: 38, failed: 2, coverage: 80.0, status: 'completed', userId },
      { name: 'Notification Test Report', type: 'summary', projectName: 'Notification Service', totalTests: 73, passed: 70, failed: 3, coverage: 80.0, status: 'completed', userId },
      { name: 'Search Quality Report', type: 'custom', projectName: 'Search Engine', totalTests: 42, passed: 40, failed: 2, coverage: 85.0, status: 'completed', userId },
      { name: 'Auth Regression Report', type: 'regression', projectName: 'Auth Microservice', totalTests: 88, passed: 86, failed: 2, coverage: 95.0, status: 'completed', userId },
      { name: 'Platform Wide Report', type: 'summary', projectName: 'All Projects', totalTests: 1850, passed: 1745, failed: 105, coverage: 81.3, status: 'completed', userId }
    ]);

    console.log('Seed completed successfully!');
    console.log('Demo User: demo@testgen.ai / demo123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
