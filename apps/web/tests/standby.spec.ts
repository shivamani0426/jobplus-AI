import { test, expect } from '@playwright/test'

test.beforeEach(() => {
  test.skip(process.env.INTELLIGENCE_API_URL !== 'http://127.0.0.1:7999', 'Only for intentional backend-outage CI tests')
})

const sample = 'Fictional student resume using Python, SQL, Pandas, Git and NumPy. Built a statistics dashboard with data visualization for university project and worked in a student team.'
test('standby skill analysis works with intentionally unavailable Python API', async ({ request }) => {
  const response = await request.post('/api/intelligence/v1/analyze/text', {
    data: {role_id: 'data-scientist', text: sample},
  })
  expect(response.status()).toBe(200)
  expect(response.headers()['x-jobpulse-mode']).toBe('local-standby')
  const result = await response.json()
  expect(result.role_id).toBe('data-scientist')
  expect(result.score_type).toBe('weighted_keyword_alignment')
  expect(result.matched.map((x:{skill:string})=>x.skill)).toEqual(expect.arrayContaining(['Python','SQL','Pandas','Git','NumPy']))
  expect(result.roadmap.length).toBeGreaterThan(0)
  expect(result.disclaimer).toMatch(/hiring probability/)
})

test('standby PDF report remains downloadable during backend sleep', async ({ request }) => {
  const analyzed = await request.post('/api/intelligence/v1/analyze/text', { data: {role_id:'data-scientist',text:sample} })
  expect(analyzed.status()).toBe(200)
  const data = await analyzed.json()
  const response = await request.post('/api/intelligence/v1/report', { data })
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  expect(response.headers()['x-jobpulse-mode']).toBe('local-standby')
  expect((await response.body()).subarray(0,5).toString('utf8')).toBe('%PDF-')
})

test('standby market data stays clearly synthetic', async ({ request }) => {
  const response = await request.get('/api/intelligence/v1/market?role_id=data-scientist&horizon=6')
  expect(response.status()).toBe(200)
  expect(response.headers()['x-jobpulse-mode']).toBe('local-standby')
  const data = await response.json()
  expect(data.data_status).toBe('synthetic_demo')
  expect(data.can_make_real_world_claims).toBe(false)
  expect(data.history).toHaveLength(18)
  expect(data.forecast).toHaveLength(6)
})

test('judges can run the fictional resume and download PDF as guests with no Python backend', async ({page}) => {
  await page.goto('/app/resume')
  await page.getByRole('button',{name:/Load a fictional student resume/i}).click()
  await page.getByRole('button',{name:/Generate skills analysis/i}).click()
  const result = page.locator('.analysis-result')
  await expect(result).toBeVisible({timeout:30_000})
  await expect(result).toContainText('Python')
  const download = page.waitForEvent('download')
  await page.getByRole('button',{name:/Download report/i}).click()
  expect((await download).suggestedFilename()).toMatch(/\.pdf$/i)
})
