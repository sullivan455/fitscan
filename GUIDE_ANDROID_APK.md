# 📱 Como Gerar o APK do FitScan AI

Este guia contém todos os passos para transformar este projeto em um aplicativo Android (.apk) instalável.

## 🛠️ 1. Pré-requisitos
No seu computador, você precisa ter instalado:
1.  **Node.js** (Versão 18 ou superior) - [Baixar aqui](https://nodejs.org/)
2.  **Android Studio** - [Baixar aqui](https://developer.android.com/studio)
    *   Durante a instalação, certifique-se de marcar "Android SDK" e "Android Virtual Device".

---

## 🚀 2. Preparando o Projeto no PC

1.  Crie uma pasta no seu computador chamada `FitScanAI`.
2.  Baixe todos os arquivos deste projeto e coloque dentro dessa pasta.
3.  Crie um arquivo chamado `package.json` na raiz da pasta com o seguinte conteúdo (se não existir):

```json
{
  "name": "fitscan-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.30.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^3.5.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "@capacitor/cli": "^6.0.0"
  }
}
```

4.  **IMPORTANTE:** Crie um arquivo chamado `.env` na raiz da pasta e cole sua chave da API do Google Gemini:
```env
API_KEY=sua_chave_api_aqui
```

---

## 💻 3. Comandos de Instalação

Abra o terminal (Prompt de Comando ou PowerShell) dentro da pasta do projeto e rode os comandos na ordem:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Construir o site (gera a pasta 'dist')
npm run build

# 3. Inicializar o Capacitor (se pedir para substituir, diga yes)
npx cap init FitScan com.fitscan.ai.app --web-dir=dist

# 4. Adicionar a plataforma Android
npx cap add android

# 5. Sincronizar os arquivos do site com o projeto Android
npx cap sync
```

---

## ⚙️ 4. Configurando Permissões (Manifesto)

Após rodar o comando acima, uma pasta `android` foi criada. Vamos configurar as permissões de Câmera e Internet.

1.  Abra o arquivo: `android/app/src/main/AndroidManifest.xml`
2.  Substitua o conteúdo ou adicione as permissões `<uses-permission>` antes da tag `<application>`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- PERMISSÕES NECESSÁRIAS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

---

## 🏗️ 5. Gerando o APK no Android Studio

1.  No terminal, rode:
    ```bash
    npx cap open android
    ```
    *(Isso vai abrir o Android Studio automaticamente)*.

2.  Aguarde o Android Studio indexar o projeto (pode demorar uns minutos na primeira vez).

3.  **Para testar no emulador:**
    *   Clique no botão "Play" (triângulo verde) no topo.

4.  **Para Gerar o APK Final:**
    *   Vá no menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    *   O Android Studio vai compilar.
    *   Quando terminar, aparecerá uma notificação no canto inferior direito. Clique em **"locate"**.
    *   Pronto! Lá estará seu arquivo `app-debug.apk`. Você pode enviar esse arquivo para seu celular e instalar.

## 📦 6. (Opcional) Gerar APK Assinado (Para Play Store)

Se quiser publicar na loja ou remover o aviso de "Debug":
1.  Vá em **Build > Generate Signed Bundle / APK**.
2.  Escolha "APK".
3.  Crie uma nova KeyStore (senha e certificado).
4.  Escolha a versão "Release".
5.  O APK final será gerado na pasta `android/app/release`.
