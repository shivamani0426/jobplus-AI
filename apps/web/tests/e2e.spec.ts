import { test, expect } from '@playwright/test'

const SAMPLE = 'I built and deployed data projects using Python, SQL, Pandas, NumPy, Scikit-learn, statistics and Git. I developed dashboards for student projects and participated in university hackathons.'

test('landing and workspace navigation work without a login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.goto('/app')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Workspace navigation' })
  await expect(nav.getByRole('link', { name: /Resume studio/i })).toHaveAttribute('href', '/app/resume')
  await page.goto('/app/resume')
  await expect(page.getByRole('button', { name: /Generate skills analysis/i })).toBeVisible()
  await page.goto('/app/methodology')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('market API returns clearly labelled synthetic data and chart is visible', async ({ page, request }) => {
  const response = await request.get('/api/intelligence/v1/market?role_id=data-scientist&horizon=6')
  expect(response.status()).toBe(200)
  const data = await response.json()
  expect(data.data_status).toBe('synthetic_demo')
  expect(data.can_make_real_world_claims).toBe(false)
  expect(data.history).toHaveLength(18)
  expect(data.forecast).toHaveLength(6)
  await page.goto('/app/market')
  await expect(page.getByText(/Synthetic history/i).first()).toBeVisible({ timeout: 50_000 })
})

test('resume text produces keyword analysis, PDF report, and a roadmap', async ({ page }) => {
  await page.goto('/app/resume')
  await page.getByLabel('Resume details').fill(SAMPLE)
  await page.getByRole('button', { name: /Generate skills analysis/i }).click()
  await expect(page.locator('.analysis-result')).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.analysis-result')).toContainText('SQL')
  const save = page.waitForEvent('download')
  await page.getByRole('button', { name: /Download report/i }).click()
  const download = await save
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  await page.goto('/app/roadmap')
  await expect(page.getByText(/Your path to/i)).toBeVisible()
})

test('resume PDF is processed end-to-end and obvious invalid file types are rejected', async ({ page }) => {
  await page.goto('/app/resume')
  const input = page.locator('input[aria-label="Upload resume PDF"]')
  await input.setInputFiles({ name: 'not-a-resume.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid file') })
  await expect(page.locator('.alert-error')).toContainText('Choose a PDF file')
  await input.setInputFiles('tests/fixtures/sample-resume.pdf')
  await page.getByRole('button', { name: /Generate skills analysis/i }).click()
  await expect(page.locator('.analysis-result')).toBeVisible({ timeout: 60_000 })
})

test('signup email rate-limit is explained and offers guest access without sending email', async ({ page }) => {
  let intercepted = 0
  await page.route('**/auth/v1/signup**', async (route) => {
    const headers = {
      'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'apikey, authorization, content-type, x-client-info',
      'content-type': 'application/json',
    }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers, body: '' })
    intercepted++
    return route.fulfill({ status: 429, headers, body: JSON.stringify({ code: 'over_email_send_rate_limit', msg: 'email rate limit exceeded' }) })
  })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await page.getByLabel('Email address').fill('e2e-demo@invalid.example')
  await page.locator('#login-pass').fill('NotARealPassword!42')
  await page.getByRole('button', { name: /Create free account/i }).click()
  await expect(page.locator('.alert-error')).toContainText('sending limit')
  await expect(page.getByRole('link', { name: /Continue without an account/i })).toHaveAttribute('href', '/app')
  expect(intercepted).toBe(1)
})

test('reports and settings correctly explain the guest mode', async ({ page }) => {
  await page.goto('/app/reports')
  await expect(page.getByText(/Sign in to save reports privately/i)).toBeVisible()
  await page.goto('/app/settings')
  await expect(page.getByText(/exploring as a guest/i)).toBeVisible()
})

test('mobile navigation opens and reaches the resume studio', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only user flow')
  await page.goto('/app')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('navigation', { name: 'Workspace navigation' }).getByRole('link', { name: /Resume studio/i }).click()
  await expect(page.getByRole('button', { name: /Generate skills analysis/i })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})


test('guest AI coach is optional and can answer a mocked career question', async ({ page, request }) => {
  const liveStatus = await request.get('/api/ai/coach')
  expect(liveStatus.status()).toBe(200)
  const status = await liveStatus.json()
  expect(typeof status.configured).toBe('boolean')
  expect(status.guest_access).toBe(true)

  let requests = 0
  await page.route('**/api/ai/coach', async route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({configured:true,model:'openrouter/free',guest_access:true})})
    }
    const body = route.request().postDataJSON()
    expect(body.role_id).toBe('data-scientist')
    expect(JSON.stringify(body)).not.toContain('resume_text')
    requests += 1
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({answer:'1. Practice SQL with a sample project.\n2. Build a Python portfolio.\n3. Document your learning.',model:'test/mock',disclaimer:'Educational guidance only.'})})
  })
  await page.goto('/app/coach')
  await expect(page.getByRole('heading',{name:/AI Career Coach/i}).first()).toBeVisible()
  await page.getByLabel('What would you like help with?').fill('Suggest three beginner projects for this career.')
  await page.getByRole('button',{name:/Get career guidance/i}).click()
  await expect(page.getByText(/Practice SQL with a sample project/)).toBeVisible()
  expect(requests).toBe(1)
})

test('guest demo can load a fictional resume without signing in', async ({ page }) => {
  await page.goto('/app/resume')
  await page.getByRole('button',{name:/Load a fictional student resume/i}).click()
  await expect(page.getByLabel('Resume details')).toContainText('Fictional student resume')
  await page.getByRole('button',{name:/Generate skills analysis/i}).click()
  await expect(page.locator('.analysis-result')).toBeVisible({timeout:60_000})
})
