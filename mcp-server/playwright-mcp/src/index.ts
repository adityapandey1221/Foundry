import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, Browser, Page } from "playwright";

// Tool schemas
const NavigateSchema = z.object({
  url: z.string().describe("URL to navigate to"),
});

const ScreenshotSchema = z.object({
  path: z.string().optional().describe("Optional file path to save screenshot"),
  fullPage: z.boolean().optional().describe("Capture full page height"),
});

const ClickSchema = z.object({
  selector: z.string().describe("CSS selector of element to click"),
  button: z.enum(["left", "right", "middle"]).optional().describe("Mouse button"),
  clickCount: z.number().optional().describe("Number of clicks"),
});

const TypeSchema = z.object({
  selector: z.string().describe("CSS selector of element"),
  text: z.string().describe("Text to type"),
  delay: z.number().optional().describe("Delay between characters in ms"),
});

const FillSchema = z.object({
  selector: z.string().describe("CSS selector of form field"),
  text: z.string().describe("Text to fill"),
});

const WaitForSelectorSchema = z.object({
  selector: z.string().describe("CSS selector to wait for"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
});

const WaitForLoadStateSchema = z.object({
  state: z.enum(["load", "domcontentloaded", "networkidle"]).describe("Page load state"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
});

const QuerySelectorSchema = z.object({
  selector: z.string().describe("CSS selector"),
});

const QuerySelectorAllSchema = z.object({
  selector: z.string().describe("CSS selector"),
});

const HoverSchema = z.object({
  selector: z.string().describe("CSS selector of element to hover"),
});

const CheckSchema = z.object({
  selector: z.string().describe("CSS selector of checkbox"),
});

const UncheckSchema = z.object({
  selector: z.string().describe("CSS selector of checkbox"),
});

const IsCheckedSchema = z.object({
  selector: z.string().describe("CSS selector of checkbox"),
});

const IsVisibleSchema = z.object({
  selector: z.string().describe("CSS selector"),
});

const IsEnabledSchema = z.object({
  selector: z.string().describe("CSS selector"),
});

const GetAttributeSchema = z.object({
  selector: z.string().describe("CSS selector"),
  attribute: z.string().describe("Attribute name"),
});

const PressSchema = z.object({
  key: z.string().describe("Key to press (e.g., 'Enter', 'Escape', 'ArrowUp')"),
});

const SelectSchema = z.object({
  selector: z.string().describe("CSS selector of select element"),
  value: z.string().describe("Option value to select"),
});

const GetPageContentSchema = z.object({
  includeText: z.boolean().optional().describe("Include text content"),
});

// Global browser and page instances
let browser: Browser | null = null;
let page: Page | null = null;

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch();
  }
  return browser;
}

async function ensurePage() {
  const b = await ensureBrowser();
  if (!page) {
    page = await b.newPage();
  }
  return page;
}

class PlaywrightServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "playwright-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "navigate",
          description: "Navigate to a URL",
          inputSchema: {
            type: "object" as const,
            properties: {
              url: { type: "string", description: "URL to navigate to" },
            },
            required: ["url"],
          },
        },
        {
          name: "screenshot",
          description: "Take a screenshot of the current page",
          inputSchema: {
            type: "object" as const,
            properties: {
              path: { type: "string", description: "Optional file path to save screenshot" },
              fullPage: { type: "boolean", description: "Capture full page height" },
            },
          },
        },
        {
          name: "click",
          description: "Click an element",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string", description: "CSS selector of element to click" },
              button: { type: "string", enum: ["left", "right", "middle"] },
              clickCount: { type: "number" },
            },
            required: ["selector"],
          },
        },
        {
          name: "type",
          description: "Type text into an element",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
              text: { type: "string" },
              delay: { type: "number" },
            },
            required: ["selector", "text"],
          },
        },
        {
          name: "fill",
          description: "Fill a form field with text",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
              text: { type: "string" },
            },
            required: ["selector", "text"],
          },
        },
        {
          name: "wait_for_selector",
          description: "Wait for an element to appear",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
              timeout: { type: "number" },
            },
            required: ["selector"],
          },
        },
        {
          name: "wait_for_load_state",
          description: "Wait for page to reach a load state",
          inputSchema: {
            type: "object" as const,
            properties: {
              state: { type: "string", enum: ["load", "domcontentloaded", "networkidle"] },
              timeout: { type: "number" },
            },
            required: ["state"],
          },
        },
        {
          name: "query_selector",
          description: "Find an element by CSS selector",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "query_selector_all",
          description: "Find all elements matching a CSS selector",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "get_page_content",
          description: "Get the full HTML content or text of the page",
          inputSchema: {
            type: "object" as const,
            properties: {
              includeText: { type: "boolean" },
            },
          },
        },
        {
          name: "hover",
          description: "Hover over an element",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "check",
          description: "Check a checkbox",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "uncheck",
          description: "Uncheck a checkbox",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "is_checked",
          description: "Check if a checkbox is checked",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "is_visible",
          description: "Check if an element is visible",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "is_enabled",
          description: "Check if an element is enabled",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
            },
            required: ["selector"],
          },
        },
        {
          name: "get_attribute",
          description: "Get an attribute value of an element",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
              attribute: { type: "string" },
            },
            required: ["selector", "attribute"],
          },
        },
        {
          name: "press",
          description: "Press a keyboard key",
          inputSchema: {
            type: "object" as const,
            properties: {
              key: { type: "string" },
            },
            required: ["key"],
          },
        },
        {
          name: "select",
          description: "Select an option in a select element",
          inputSchema: {
            type: "object" as const,
            properties: {
              selector: { type: "string" },
              value: { type: "string" },
            },
            required: ["selector", "value"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const p = await ensurePage();
        const { name, arguments: args } = request.params;

        switch (name) {
          case "navigate": {
            const { url } = NavigateSchema.parse(args);
            await p.goto(url);
            return { content: [{ type: "text", text: `Navigated to ${url}` }] };
          }

          case "screenshot": {
            const { path, fullPage } = ScreenshotSchema.parse(args);
            const screenshotPath = path || "/tmp/playwright-screenshot.png";
            const buffer = await p.screenshot({ fullPage: fullPage ?? false });
            if (path) {
              require("fs").writeFileSync(path, buffer);
            }
            return { content: [{ type: "text", text: `Screenshot saved to ${screenshotPath}` }] };
          }

          case "click": {
            const { selector, button, clickCount } = ClickSchema.parse(args);
            await p.click(selector, { button: button as any, clickCount });
            return { content: [{ type: "text", text: `Clicked ${selector}` }] };
          }

          case "type": {
            const { selector, text, delay } = TypeSchema.parse(args);
            await p.type(selector, text, { delay });
            return { content: [{ type: "text", text: `Typed text into ${selector}` }] };
          }

          case "fill": {
            const { selector, text } = FillSchema.parse(args);
            await p.fill(selector, text);
            return { content: [{ type: "text", text: `Filled ${selector}` }] };
          }

          case "wait_for_selector": {
            const { selector, timeout } = WaitForSelectorSchema.parse(args);
            await p.waitForSelector(selector, { timeout });
            return { content: [{ type: "text", text: `Element ${selector} appeared` }] };
          }

          case "wait_for_load_state": {
            const { state, timeout } = WaitForLoadStateSchema.parse(args);
            await p.waitForLoadState(state as any, { timeout });
            return {
              content: [{ type: "text", text: `Page reached ${state} state` }],
            };
          }

          case "query_selector": {
            const { selector } = QuerySelectorSchema.parse(args);
            const element = await p.$(selector);
            if (!element) {
              return {
                content: [{ type: "text", text: `Element ${selector} not found` }],
              };
            }
            const boundingBox = await element.boundingBox();
            const isVisible = await element.isVisible();
            const text = await element.innerText().catch(() => "");
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      found: true,
                      selector,
                      visible: isVisible,
                      text,
                      boundingBox,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case "query_selector_all": {
            const { selector } = QuerySelectorAllSchema.parse(args);
            const elements = await p.$$(selector);
            const results = await Promise.all(
              elements.map(async (el) => ({
                text: await el.innerText().catch(() => ""),
                visible: await el.isVisible(),
              }))
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      count: elements.length,
                      selector,
                      elements: results,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case "get_page_content": {
            const { includeText } = GetPageContentSchema.parse(args);
            let content: string;
            if (includeText) {
              content = await p.innerText("body");
            } else {
              content = await p.content();
            }
            return { content: [{ type: "text", text: content }] };
          }

          case "hover": {
            const { selector } = HoverSchema.parse(args);
            await p.hover(selector);
            return { content: [{ type: "text", text: `Hovered over ${selector}` }] };
          }

          case "check": {
            const { selector } = CheckSchema.parse(args);
            await p.check(selector);
            return { content: [{ type: "text", text: `Checked ${selector}` }] };
          }

          case "uncheck": {
            const { selector } = UncheckSchema.parse(args);
            await p.uncheck(selector);
            return { content: [{ type: "text", text: `Unchecked ${selector}` }] };
          }

          case "is_checked": {
            const { selector } = IsCheckedSchema.parse(args);
            const checked = await p.isChecked(selector);
            return {
              content: [{ type: "text", text: `${selector} is ${checked ? "checked" : "unchecked"}` }],
            };
          }

          case "is_visible": {
            const { selector } = IsVisibleSchema.parse(args);
            const visible = await p.isVisible(selector);
            return {
              content: [{ type: "text", text: `${selector} is ${visible ? "visible" : "hidden"}` }],
            };
          }

          case "is_enabled": {
            const { selector } = IsEnabledSchema.parse(args);
            const enabled = await p.isEnabled(selector);
            return {
              content: [{ type: "text", text: `${selector} is ${enabled ? "enabled" : "disabled"}` }],
            };
          }

          case "get_attribute": {
            const { selector, attribute } = GetAttributeSchema.parse(args);
            const value = await p.getAttribute(selector, attribute);
            return {
              content: [
                {
                  type: "text",
                  text: `${attribute}="${value}"`,
                },
              ],
            };
          }

          case "press": {
            const { key } = PressSchema.parse(args);
            await p.press("body", key);
            return { content: [{ type: "text", text: `Pressed ${key}` }] };
          }

          case "select": {
            const { selector, value } = SelectSchema.parse(args);
            await p.selectOption(selector, value);
            return { content: [{ type: "text", text: `Selected ${value} in ${selector}` }] };
          }

          default:
            return {
              content: [{ type: "text", text: `Unknown tool: ${name}` }],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Playwright MCP server running on stdio");

    // Graceful shutdown
    process.on("SIGINT", async () => {
      if (page) await page.close();
      if (browser) await browser.close();
      process.exit(0);
    });
  }
}

const server = new PlaywrightServer();
server.run().catch(console.error);
