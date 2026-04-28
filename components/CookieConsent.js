'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'cloud',
          position: 'bottom center',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }],
          },
          services: {
            ga: {
              label: 'Google Analytics',
              onAccept: () => {},
              onReject: () => {},
            },
          },
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We value your privacy',
              description:
                'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Reject All',
              showPreferencesBtn: 'Customize',
              footer: `<a href="/privacy-policy">Privacy Policy</a>`,
            },
            preferencesModal: {
              title: 'Cookie Preferences',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Reject All',
              savePreferencesBtn: 'Save Preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Your Privacy Choices',
                  description:
                    'You can choose how we use your data. For more information, please visit our Privacy Policy.',
                },
                {
                  title: 'Strictly Necessary',
                  description:
                    'These cookies are essential for the website to function properly and cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Performance and Analytics',
                  description:
                    'These cookies help us understand how visitors interact with our website. All data is anonymized.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'More Information',
                  description:
                    'For any questions about our cookie policy, please <a href="/privacy-policy">contact us</a>.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
