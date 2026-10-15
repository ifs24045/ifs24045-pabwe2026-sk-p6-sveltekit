import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { page } from "$app/state";
import { authStore } from "./features/auth/states/authStore";
import { usersStore } from "./features/users/states/usersStore";

function createWrapper(element: Element | null) {
  const el = element as HTMLElement;
  return {
    element: el,
    exists: () => element !== null,
    text: () => el.textContent?.trim() ?? "",
    find: (selector: string) => createWrapper(el.querySelector(selector)),
    findAll: (selector: string) =>
      Array.from(el.querySelectorAll(selector)).map((node) => createWrapper(node)),
    async trigger(eventName: string) {
      if (eventName === "click") {
        el.click();
      } else {
        el.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true }));
      }
      await tick();
    },
    async setValue(value: string) {
      (el as HTMLInputElement).value = value;
      const eventName = el.tagName === "SELECT" ? "change" : "input";
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
      await tick();
    },
  };
}

function preloadStores(preloadedState: Record<string, any>) {
  [authStore, usersStore].forEach((store: any) => {
    const ownState = Object.fromEntries(
      Object.entries(preloadedState).filter(([key]) => key in store.$state)
    );
    if (Object.keys(ownState).length > 0) {
      store.reset(ownState);
    }
  });
}

type RenderOptions = {
  props?: Record<string, any>;
  preloadedState?: Record<string, any>;
  route?: string;
  params?: Record<string, string>;
};

export function renderWithProviders(
  Component: any,
  { props = {}, preloadedState = {}, route, params }: RenderOptions = {}
) {
  preloadStores(preloadedState);

  if (route) {
    (page as any).url = new URL(route, "http://localhost");
  }
  if (params) {
    (page as any).params = params;
  }

  const { container } = render(Component, { props });

  return {
    wrapper: createWrapper(container),
    authStore,
    usersStore,
  };
}