import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'

const projectRoot = process.cwd()
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const staticServerScript = path.join(projectRoot, 'scripts', 'serve-dist.mjs')
const outputDir = path.join(projectRoot, 'artifacts', 'demo-clicks')
const rawVideoDir = path.join(outputDir, 'raw')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const logStep = (message) => console.log(`[demo-clicks] ${message}`)

const getFreePort = async () =>
  await new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        const { port } = address
        server.close(() => resolve(port))
        return
      }

      server.close()
      reject(new Error('No se pudo obtener un puerto libre.'))
    })
    server.on('error', reject)
  })

const waitForServer = async (url, timeoutMs = 15000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // reintento
    }
    await delay(250)
  }

  throw new Error(`El servidor no respondio a tiempo en ${url}`)
}

const setCaption = async (page, text) => {
  await page.evaluate((value) => {
    let banner = document.getElementById('__demo_caption')
    if (!banner) {
      banner = document.createElement('div')
      banner.id = '__demo_caption'
      Object.assign(banner.style, {
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '2147483647',
        maxWidth: '80vw',
        padding: '12px 20px',
        borderRadius: '999px',
        background: 'rgba(18, 32, 51, 0.88)',
        color: '#ffffff',
        fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '0.02em',
        boxShadow: '0 12px 30px rgba(18, 32, 51, 0.28)',
        pointerEvents: 'none',
      })
      document.body.appendChild(banner)
    }
    banner.textContent = value
  }, text)
}

const highlightElement = async (locator) => {
  await locator.evaluate((element) => {
    const previousTransition = element.style.transition
    const previousBoxShadow = element.style.boxShadow
    element.style.transition = 'box-shadow 180ms ease'
    element.style.boxShadow = '0 0 0 4px rgba(215, 179, 106, 0.85)'
    setTimeout(() => {
      element.style.transition = previousTransition
      element.style.boxShadow = previousBoxShadow
    }, 900)
  })
}

const getLocatorCenter = async (locator) => {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('No se pudo calcular la posicion del elemento para marcar el clic.')
  }

  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  }
}

const pulseClickMarker = async (page, x, y) => {
  await page.evaluate(
    ([clickX, clickY]) => {
      let root = document.getElementById('__demo_click_marker_root')
      if (!root) {
        root = document.createElement('div')
        root.id = '__demo_click_marker_root'
        document.body.appendChild(root)
      }

      if (!document.getElementById('__demo_click_marker_style')) {
        const style = document.createElement('style')
        style.id = '__demo_click_marker_style'
        style.textContent = `
          .__demo-click-marker {
            position: fixed;
            left: 0;
            top: 0;
            width: 30px;
            height: 30px;
            margin-left: -15px;
            margin-top: -15px;
            border: 4px solid rgba(255, 0, 0, 0.98);
            border-radius: 999px;
            background: rgba(255, 0, 0, 0.22);
            box-shadow: 0 0 0 8px rgba(255, 0, 0, 0.14);
            z-index: 2147483647;
            pointer-events: none;
            animation: __demo-click-pulse 760ms ease-out forwards;
          }

          @keyframes __demo-click-pulse {
            0% {
              transform: translate(var(--demo-click-x), var(--demo-click-y)) scale(0.55);
              opacity: 1;
            }
            72% {
              transform: translate(var(--demo-click-x), var(--demo-click-y)) scale(1.45);
              opacity: 0.92;
            }
            100% {
              transform: translate(var(--demo-click-x), var(--demo-click-y)) scale(2.1);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }

      const marker = document.createElement('div')
      marker.className = '__demo-click-marker'
      marker.style.setProperty('--demo-click-x', `${clickX}px`)
      marker.style.setProperty('--demo-click-y', `${clickY}px`)
      root.appendChild(marker)
      setTimeout(() => marker.remove(), 900)
    },
    [x, y]
  )
}

const clickWithMarker = async (page, locator) => {
  const { x, y } = await getLocatorCenter(locator)
  await page.mouse.move(x, y, { steps: 12 })
  await pulseClickMarker(page, x, y)
  await delay(180)
  await locator.click()
}

const fillWithMarker = async (page, locator, value) => {
  await clickWithMarker(page, locator)
  await locator.fill(value)
}

const selectWithMarker = async (page, locator, value) => {
  await clickWithMarker(page, locator)
  await locator.selectOption(value)
}

const selectWrappedControl = async (page, labelText, value) => {
  const label = page.locator('label').filter({ hasText: labelText }).first()
  const select = label.locator('select')
  await selectWithMarker(page, select, value)
}

const fillWrappedInput = async (page, labelText, value) => {
  const label = page.locator('label').filter({ hasText: labelText }).first()
  const input = label.locator('input, textarea')
  await fillWithMarker(page, input, value)
}

const clearStorageAndReload = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
}

const recordDemo = async () => {
  if (!existsSync(chromePath)) {
    logStep('Chrome local no encontrado. Se usara el navegador administrado por Playwright.')
  }

  await rm(outputDir, { recursive: true, force: true })
  await mkdir(rawVideoDir, { recursive: true })
  logStep('Generando build de produccion')
  execFileSync(npmCommand, ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  const port = await getFreePort()
  const baseUrl = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, [staticServerScript], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
    },
    windowsHide: true,
  })

  try {
    await waitForServer(baseUrl)
    logStep(`Servidor listo en ${baseUrl}`)

    const browser = await chromium.launch({
      headless: true,
      slowMo: 220,
      args: ['--window-size=1440,900'],
      ...(existsSync(chromePath) ? { executablePath: chromePath } : {}),
    })

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: rawVideoDir,
        size: { width: 1440, height: 900 },
      },
    })

    const page = await context.newPage()
    const video = page.video()
    page.setDefaultTimeout(15000)

    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    await page.addInitScript(() => {
      window.open = () => null
    })

    await clearStorageAndReload(page, baseUrl)
    logStep('Storage reiniciado y app cargada')

    await setCaption(page, 'Demo con clics marcados en rojo: inicio de sesion como usuario normal')
    logStep('Login usuario normal')
    await page.getByRole('heading', { name: /Acceso al portal de publicaciones/i }).waitFor()
    await fillWithMarker(page, page.getByPlaceholder('20260001'), '20260002')
    await fillWithMarker(page, page.getByPlaceholder('Tu contrasena'), 'AlumnoSSC2026')
    await delay(700)
    await clickWithMarker(page, page.getByRole('button', { name: 'Entrar' }))
    await page.getByRole('heading', { name: /Bienvenido, Luis Herrera/i }).waitFor()
    await delay(1500)
    logStep('Usuario normal autenticado')

    await setCaption(page, 'Catalogo: filtros, orden y publicaciones destacadas')
    logStep('Explorando catalogo')
    await fillWrappedInput(page, 'Titulo o palabra clave', 'matematicas')
    await delay(900)
    await selectWrappedControl(page, 'Orden', 'views')
    await delay(700)
    await clickWithMarker(page, page.locator('.search-field-checkbox button'))
    await delay(1200)

    const resultCard = page.locator('article.publication-card').first()
    await resultCard.waitFor()
    await highlightElement(resultCard)
    await clickWithMarker(page, resultCard.getByRole('button', { name: 'Ver ficha' }))
    await page.getByRole('dialog').waitFor()
    await delay(1200)
    logStep('Modal de publicacion abierto')

    await setCaption(page, 'Ficha completa: detalle, descarga simulada y favoritos')
    const favoriteButton = page.getByRole('button', { name: 'Guardar favorito' })
    await favoriteButton.waitFor()
    await highlightElement(favoriteButton)
    await clickWithMarker(page, favoriteButton)
    await delay(1000)
    await clickWithMarker(page, page.getByRole('button', { name: 'Abrir DOI' }))
    await delay(1200)
    await clickWithMarker(page, page.getByRole('button', { name: 'Cerrar' }))
    await delay(900)
    logStep('Favorito y descarga simulada completados')

    await setCaption(page, 'Paginacion y vista de favoritos')
    logStep('Paginacion y favoritos')
    await clickWithMarker(page, page.getByRole('button', { name: 'Limpiar filtros' }))
    await delay(900)
    await clickWithMarker(page, page.getByRole('button', { name: 'Siguiente' }))
    await delay(1100)
    await clickWithMarker(page, page.getByRole('button', { name: 'Anterior' }))
    await delay(900)
    await clickWithMarker(page, page.getByRole('button', { name: 'Favoritos' }))
    await delay(1400)

    await setCaption(page, 'Cierre de sesion y cambio a perfil administrador')
    await clickWithMarker(page, page.getByRole('button', { name: 'Salir' }))
    await page.getByRole('heading', { name: /Acceso al portal de publicaciones/i }).waitFor()
    await delay(1200)
    logStep('Logout usuario normal')

    await fillWithMarker(page, page.getByPlaceholder('20260001'), '20260001')
    await fillWithMarker(page, page.getByPlaceholder('Tu contrasena'), 'AdminSSC2026')
    await delay(700)
    await clickWithMarker(page, page.getByRole('button', { name: 'Entrar' }))
    await page.getByRole('heading', { name: /Gobierno del portal editorial/i }).waitFor()
    await delay(1600)
    logStep('Administrador autenticado')

    await setCaption(page, 'Administrador: resumen general del sistema')
    logStep('Resumen admin')
    await page.mouse.wheel(0, 500)
    await delay(1200)
    await page.mouse.wheel(0, -500)
    await delay(700)

    await setCaption(page, 'Administrador: alta, edicion y eliminacion de publicaciones')
    logStep('CRUD publicaciones')
    await clickWithMarker(page, page.getByRole('button', { name: 'Publicaciones' }))
    await delay(1000)
    await clickWithMarker(page, page.getByRole('button', { name: 'Nueva publicacion' }))
    await page.getByRole('heading', { name: 'Nueva publicacion' }).waitFor()
    await delay(900)

    const publicationTitle = 'Demo automatizada integral abril 2026'
    const updatedPublicationTitle = 'Demo automatizada integral abril 2026 - edicion final'

    await fillWrappedInput(page, 'Titulo', publicationTitle)
    await fillWrappedInput(page, 'Autores', 'Equipo SSC, Automatizacion Codex')
    await fillWrappedInput(
      page,
      'Descripcion',
      'Publicacion de prueba usada para demostrar el flujo completo de alta, edicion y eliminacion en la consola administrativa.'
    )
    await fillWrappedInput(page, 'DOI', 'https://doi.org/10.53897/SSC.2026.DEMO.AUTOMATIZADA')
    await fillWrappedInput(page, 'ISBN', '9786070099999')
    await fillWrappedInput(page, 'Editorial', 'Laboratorio SSC')
    await fillWrappedInput(page, 'Fecha', '2026-04-08')
    await fillWrappedInput(page, 'Paginas', '128')
    await selectWrappedControl(page, 'Area', 'ingenieria')
    await selectWrappedControl(page, 'Idioma', 'es')
    await selectWrappedControl(page, 'Formato', 'Digital')
    await selectWrappedControl(page, 'Estatus', 'published')
    await fillWrappedInput(page, 'Palabras clave', 'demo, automatizacion, grabacion')
    await fillWrappedInput(
      page,
      'Portada',
      'https://placehold.co/360x520/f6efe4/16324f?text=Demo+Automatizada'
    )
    const featuredCheckbox = page
      .locator('label')
      .filter({ hasText: 'Marcar como destacada' })
      .locator('input')
    await clickWithMarker(page, featuredCheckbox)
    await delay(900)
    await clickWithMarker(page, page.getByRole('button', { name: 'Guardar cambios' }))
    await delay(1700)
    logStep('Publicacion creada')

    const publicationSearch = page.getByPlaceholder('Buscar titulo o autor')
    await fillWithMarker(page, publicationSearch, publicationTitle)
    await delay(900)
    const publicationRow = page.locator('tr').filter({ hasText: publicationTitle }).first()
    await publicationRow.waitFor()
    await highlightElement(publicationRow)
    await clickWithMarker(page, publicationRow.getByRole('button', { name: 'Editar' }))
    await delay(1000)
    await fillWrappedInput(page, 'Titulo', updatedPublicationTitle)
    await delay(700)
    await clickWithMarker(page, page.getByRole('button', { name: 'Guardar cambios' }))
    await delay(1600)
    logStep('Publicacion editada')
    await fillWithMarker(page, publicationSearch, updatedPublicationTitle)
    await delay(800)
    const updatedRow = page.locator('tr').filter({ hasText: updatedPublicationTitle }).first()
    await updatedRow.waitFor()
    await highlightElement(updatedRow)
    await clickWithMarker(page, updatedRow.getByRole('button', { name: 'Eliminar' }))
    await delay(1600)
    logStep('Publicacion eliminada')

    await setCaption(page, 'Administrador: gestion completa de usuarios')
    logStep('CRUD usuarios')
    await clickWithMarker(page, page.getByRole('button', { name: 'Usuarios' }))
    await delay(1200)
    await clickWithMarker(page, page.getByRole('button', { name: 'Nuevo usuario' }))
    await delay(900)

    const demoAccount = '20269990'
    await fillWrappedInput(page, 'Numero de cuenta', demoAccount)
    await fillWrappedInput(page, 'Contrasena', 'DemoUser2026')
    await fillWrappedInput(page, 'Nombre completo', 'Usuario Demo Grabacion')
    await fillWrappedInput(page, 'Correo', 'usuario.demo.grabacion@ucol.mx')
    await selectWrappedControl(page, 'Rol', 'normal')
    await selectWrappedControl(page, 'Estatus', 'active')
    await fillWrappedInput(page, 'Carrera o area', 'Ingenieria de software')
    await fillWrappedInput(page, 'Telefono', '3125559000')
    await fillWrappedInput(
      page,
      'Bio',
      'Cuenta temporal para mostrar alta, edicion, promocion de rol y cambio de estatus.'
    )
    await delay(900)
    await clickWithMarker(page, page.getByRole('button', { name: 'Guardar usuario' }))
    await delay(1700)
    logStep('Usuario creado')

    const userSearch = page.getByPlaceholder('Buscar cuenta, nombre o correo')
    await fillWithMarker(page, userSearch, demoAccount)
    await delay(900)
    const demoUserRow = page.locator('tr').filter({ hasText: demoAccount }).first()
    await demoUserRow.waitFor()
    await clickWithMarker(page, demoUserRow.getByRole('button', { name: 'Editar' }))
    await delay(900)
    await fillWrappedInput(
      page,
      'Bio',
      'Cuenta temporal actualizada durante la grabacion automatizada del sistema.'
    )
    await delay(700)
    await clickWithMarker(page, page.getByRole('button', { name: 'Guardar usuario' }))
    await delay(1400)
    logStep('Usuario editado')

    await fillWithMarker(page, userSearch, demoAccount)
    await delay(600)
    const updatedUserRow = page.locator('tr').filter({ hasText: demoAccount }).first()
    await updatedUserRow.waitFor()
    await clickWithMarker(page, updatedUserRow.getByRole('button', { name: 'Hacer admin' }))
    await delay(1200)
    await clickWithMarker(page, updatedUserRow.getByRole('button', { name: 'Desactivar' }))
    await delay(1200)
    await selectWithMarker(page, page.locator('.toolbar-filters select').first(), 'admin')
    await delay(700)
    await selectWithMarker(page, page.locator('.toolbar-filters select').nth(1), 'inactive')
    await delay(1200)
    logStep('Rol y estatus del usuario actualizados')

    await setCaption(page, 'Administrador: bitacora final de actividad y evidencias')
    logStep('Bitacora admin')
    await clickWithMarker(page, page.getByRole('button', { name: 'Actividad' }))
    await delay(1500)
    await page.mouse.wheel(0, 700)
    await delay(1400)
    await page.mouse.wheel(0, -700)
    await delay(900)

    await setCaption(page, 'Demo finalizada: sistema probado con clics marcados en rojo')
    await delay(1800)
    logStep('Cerrando navegador y guardando video')

    await context.close()
    await browser.close()

    const rawVideoPath = await video.path()
    const finalWebmPath = path.join(outputDir, 'demo-funcionalidades-click-rojo.webm')
    const finalMp4Path = path.join(outputDir, 'demo-funcionalidades-click-rojo.mp4')
    const notesPath = path.join(outputDir, 'README.txt')

    await rm(finalWebmPath, { force: true })
    await rm(finalMp4Path, { force: true })
    await copyFile(rawVideoPath, finalWebmPath)

    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        finalWebmPath,
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        finalMp4Path,
      ],
      { stdio: 'ignore' }
    )

    await writeFile(
      notesPath,
      [
        'Grabacion simulada con indicadores rojos de clic.',
        '',
        `URL usada: ${baseUrl}`,
        'Cuentas mostradas:',
        'Usuario normal: 20260002 / AlumnoSSC2026',
        'Administrador: 20260001 / AdminSSC2026',
        '',
        'Archivos:',
        `- ${path.basename(finalWebmPath)}`,
        `- ${path.basename(finalMp4Path)}`,
      ].join('\n'),
      'utf8'
    )

    console.log(`Demo con clics lista en: ${finalMp4Path}`)
  } finally {
    server.kill('SIGTERM')
  }
}

recordDemo().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
