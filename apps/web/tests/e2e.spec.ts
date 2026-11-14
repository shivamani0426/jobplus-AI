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
  await expect(page.getByRole('alert')).toContainText('Choose a PDF file')
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
  await page.getByLabel('Password').fill('NotARealPassword!42')
  await page.getByRole('button', { name: /Create free account/i }).click()
  await expect(page.getByRole('alert')).toContainText('sending limit')
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
