window.__ModuleLoader__.load({
	id: "dsh-multi-workspace-client",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let zod = require("zod");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		// ../host/lib/remote-contract-D3U3-K2U.js
		const path = zod.z.string().min(1);
		const workspaceId = zod.z.string().min(1);
		const record = zod.z.object({
			workspaceId,
			paths: zod.z.array(path).min(1),
			primaryPath: path,
			updatedAt: zod.z.string()
		});
		function parameter(name, schema) {
			return {
				name,
				wire: name,
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: `dsh-multi-workspace-host#${name}`,
					create: () => schema
				}
			};
		}
		// ../host/lib/remote.js
		const TYPERT_REMOTE = {
			package: "dsh-multi-workspace-host",
			descriptors: [
				{
					id: "dsh-multi-workspace-host#multiWorkspace/register",
					service: "multiWorkspace",
					namespace: "multiWorkspace",
					method: "register",
					invocation: { kind: "direct" },
					parameters: [
						parameter("workspaceId", workspaceId),
						parameter("paths", zod.z.array(path).min(1)),
						parameter("primaryPath", path)
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-multi-workspace-host/types#MultiWorkspaceRecord",
						create: () => record
					}
				},
				{
					id: "dsh-multi-workspace-host#multiWorkspace/get",
					service: "multiWorkspace",
					namespace: "multiWorkspace",
					method: "get",
					invocation: { kind: "direct" },
					parameters: [parameter("workspaceId", workspaceId)],
					result: {
						mode: "strict",
						typeSymbol: "dsh-multi-workspace-host/types#MultiWorkspaceRecord",
						create: () => record.nullable()
					}
				},
				{
					id: "dsh-multi-workspace-host#multiWorkspace/delete",
					service: "multiWorkspace",
					namespace: "multiWorkspace",
					method: "delete",
					invocation: { kind: "direct" },
					parameters: [parameter("workspaceId", workspaceId)],
					result: {
						mode: "strict",
						typeSymbol: "dsh-multi-workspace-host#boolean",
						create: () => zod.z.boolean()
					}
				}
			]
		};
		// \0dsh-css:C:\Users\lenovo\Documents\dsh-multi-workspace\packages\client\src\client\MultiWorkspaceFlow.module.css.mjs
		const css = ".SD_GaW_dialog{width:min(700px,100vw - 48px);max-height:calc(100vh - 48px)}.SD_GaW_content{min-height:0;overflow-y:auto}.SD_GaW_body{flex-direction:column;gap:24px;min-width:0;display:flex}.SD_GaW_nameField{border:1px solid var(--dsw-alias-border-l2);min-width:0;color:var(--dsw-alias-label-secondary);border-radius:12px;grid-template-columns:44px minmax(0,1fr);align-items:center;display:grid;overflow:hidden}.SD_GaW_nameField>svg{justify-self:center}.SD_GaW_nameField input{border:0;border-left:1px solid var(--dsw-alias-border-l2);width:100%;min-width:0;height:48px;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;outline:none;padding:0 14px}.SD_GaW_nameField input::placeholder{color:var(--dsw-alias-label-tertiary)}.SD_GaW_folderSection{flex-direction:column;gap:12px;min-width:0;display:flex}.SD_GaW_folderSection h3{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}.SD_GaW_empty,.SD_GaW_status{border:1px solid var(--dsw-alias-border-l2);min-height:170px;color:var(--dsw-alias-label-secondary);background:0 0;border-radius:12px;flex-direction:column;justify-content:center;align-items:center;gap:10px;display:flex}.SD_GaW_empty{cursor:pointer;width:100%;font:inherit}.SD_GaW_empty:hover:not(:disabled),.SD_GaW_addRow:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.SD_GaW_empty:disabled,.SD_GaW_addRow:disabled,.SD_GaW_remove:disabled,.SD_GaW_danger:disabled{cursor:not-allowed;opacity:.4}.SD_GaW_folderList{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;min-width:0;display:flex;overflow:hidden}.SD_GaW_folderRow{min-height:58px;color:var(--dsw-alias-label-secondary);grid-template-columns:20px minmax(0,1fr) auto 28px;align-items:center;gap:10px;padding:8px 14px;display:grid}.SD_GaW_folderRow+.SD_GaW_folderRow,.SD_GaW_addRow{border-top:1px solid var(--dsw-alias-border-l2)}.SD_GaW_folderCopy{flex-direction:column;gap:2px;min-width:0;display:flex}.SD_GaW_folderCopy strong,.SD_GaW_folderCopy span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.SD_GaW_folderCopy strong{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500}.SD_GaW_folderCopy span{font-size:11px}.SD_GaW_primary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);border-radius:14px;padding:3px 9px;font-size:12px}.SD_GaW_setPrimary{visibility:hidden;opacity:0;pointer-events:none;transition:opacity .12s}.SD_GaW_folderRow:hover .SD_GaW_setPrimary,.SD_GaW_folderRow:focus-within .SD_GaW_setPrimary{visibility:visible;opacity:1;pointer-events:auto}.SD_GaW_remove,.SD_GaW_removePlaceholder{width:28px;height:28px}.SD_GaW_remove{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;place-items:center;display:grid}.SD_GaW_remove:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.SD_GaW_addRow{min-height:54px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;background:0 0;border-bottom:0;border-left:0;border-right:0;align-items:center;gap:10px;padding:0 14px;display:flex}.SD_GaW_editFooter{justify-content:space-between;align-items:center;gap:16px;width:100%;display:flex}.SD_GaW_footerActions{align-items:center;gap:8px;display:flex}.SD_GaW_danger{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);min-height:36px;color:var(--dsw-alias-state-error-primary);cursor:pointer;font:inherit;border:0;border-radius:10px;padding:0 14px}.SD_GaW_error{color:var(--dsw-alias-state-error-primary);font-size:12px}@media (hover:none){.SD_GaW_setPrimary{visibility:visible;opacity:1;pointer-events:auto}}@media (width<=560px){.SD_GaW_dialog{width:calc(100vw - 24px);max-height:calc(100vh - 24px)}.SD_GaW_folderRow{grid-template-columns:20px minmax(0,1fr) 28px}.SD_GaW_folderRow>:nth-child(3){grid-column:2/4;justify-self:start}.SD_GaW_folderRow>:nth-child(4){grid-area:1/3}.SD_GaW_editFooter{flex-direction:column-reverse;align-items:stretch}.SD_GaW_footerActions{justify-content:flex-end}}";
		const tagId = "dsh-multi-workspace-client/MultiWorkspaceFlow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-multi-workspace-client";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MultiWorkspaceFlow_module_css_default = {
			"addRow": "SD_GaW_addRow",
			"body": "SD_GaW_body",
			"content": "SD_GaW_content",
			"danger": "SD_GaW_danger",
			"dialog": "SD_GaW_dialog",
			"editFooter": "SD_GaW_editFooter",
			"empty": "SD_GaW_empty",
			"error": "SD_GaW_error",
			"folderCopy": "SD_GaW_folderCopy",
			"folderList": "SD_GaW_folderList",
			"folderRow": "SD_GaW_folderRow",
			"folderSection": "SD_GaW_folderSection",
			"footerActions": "SD_GaW_footerActions",
			"nameField": "SD_GaW_nameField",
			"primary": "SD_GaW_primary",
			"remove": "SD_GaW_remove",
			"removePlaceholder": "SD_GaW_removePlaceholder",
			"setPrimary": "SD_GaW_setPrimary",
			"status": "SD_GaW_status"
		};
		// src/client/MultiWorkspaceFlow.tsx
		const folderName = (path) => path.split(/[\\/]/u).filter(Boolean).at(-1) ?? path;
		/** Add the plugin action to the Host-owned workspace menu until that menu gains a public item slot. */
		function useWorkspaceMenuEditor({ enabled, workspaces, label, open }) {
			const pending = (0, react.useRef)();
			(0, react.useEffect)(() => {
				if (!enabled) return;
				const identifyTrigger = (event) => {
					if (!(event.target instanceof Element)) return;
					const button = event.target.closest("button");
					if (button === null) return;
					const row = button.closest("[role=\"treeitem\"][aria-expanded]");
					if (row === null) return;
					if (button !== [...row.querySelectorAll("button")].at(-2)) return;
					const title = row.textContent?.trim();
					pending.current = workspaces.find((workspace) => workspace.title === title);
				};
				const decorate = (menu) => {
					const workspace = pending.current;
					if (workspace === void 0 || menu.querySelector("[data-multi-workspace-edit]") !== null) return;
					const items = [...menu.querySelectorAll("[role=\"menuitem\"]")];
					if (items.length !== 2) return;
					const renameWrap = items[0]?.parentElement;
					const deleteWrap = items[1]?.parentElement;
					if (renameWrap === null || renameWrap === void 0 || deleteWrap === null || deleteWrap === void 0) return;
					const editWrap = renameWrap.cloneNode(true);
					const editButton = editWrap.querySelector("[role=\"menuitem\"]");
					const editLabel = editButton?.querySelectorAll("span").item(1);
					if (editButton === null || editButton === void 0 || editLabel === null || editLabel === void 0) return;
					editWrap.dataset.multiWorkspaceEdit = "";
					editLabel.textContent = label;
					editButton.addEventListener("click", (event) => {
						event.preventDefault();
						event.stopImmediatePropagation();
						document.dispatchEvent(new KeyboardEvent("keydown", {
							key: "Escape",
							bubbles: true
						}));
						open(workspace);
					});
					deleteWrap.before(editWrap);
					pending.current = void 0;
				};
				const observer = new MutationObserver((records) => {
					for (const record of records) for (const node of record.addedNodes) {
						if (!(node instanceof Element)) continue;
						if (node.matches("[role=\"menu\"]")) decorate(node);
						for (const menu of node.querySelectorAll("[role=\"menu\"]")) decorate(menu);
					}
				});
				document.addEventListener("click", identifyTrigger, true);
				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
				return () => {
					document.removeEventListener("click", identifyTrigger, true);
					observer.disconnect();
				};
			}, [
				enabled,
				label,
				open,
				workspaces
			]);
		}
		function FolderList({ paths, primaryPath, busy, removable, primarySelectable, t, onRemove, onPrimary, onAdd }) {
			if (paths.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: MultiWorkspaceFlow_module_css_default.empty,
				disabled: busy,
				onClick: onAdd,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { size: 28 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("empty") })]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MultiWorkspaceFlow_module_css_default.folderList,
				children: [paths.map((path) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MultiWorkspaceFlow_module_css_default.folderRow,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { size: 16 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MultiWorkspaceFlow_module_css_default.folderCopy,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: folderName(path) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: path })]
						}),
						path === primaryPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: MultiWorkspaceFlow_module_css_default.primary,
							children: t("primary")
						}) : primarySelectable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							className: MultiWorkspaceFlow_module_css_default.setPrimary,
							size: "sm",
							variant: "toolbar",
							disabled: busy,
							"aria-label": `${t("setPrimary")}: ${path}`,
							onClick: () => {
								onPrimary(path);
							},
							children: t("setPrimary")
						}),
						removable && path !== primaryPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MultiWorkspaceFlow_module_css_default.remove,
							"aria-label": `${t("remove")}: ${path}`,
							title: t("remove"),
							disabled: busy,
							onClick: () => {
								onRemove(path);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: MultiWorkspaceFlow_module_css_default.removePlaceholder })
					]
				}, path)), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: MultiWorkspaceFlow_module_css_default.addRow,
					disabled: busy,
					onClick: onAdd,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 16 }), t("add")]
				})]
			});
		}
		/** Create multi-folder projects and edit an existing project from its row menu. */
		function MultiWorkspaceFlow(props) {
			const workspaces = props.useWorkspaces((state) => state.items);
			const [createPaths, setCreatePaths] = (0, react.useState)([]);
			const [createTitle, setCreateTitle] = (0, react.useState)("");
			const [createPrimaryPath, setCreatePrimaryPath] = (0, react.useState)();
			const [editTarget, setEditTarget] = (0, react.useState)();
			const [editPaths, setEditPaths] = (0, react.useState)([]);
			const [editTitle, setEditTitle] = (0, react.useState)("");
			const [primaryPath, setPrimaryPath] = (0, react.useState)();
			const [picking, setPicking] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(false);
			const [committing, setCommitting] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const openRef = (0, react.useRef)(false);
			useWorkspaceMenuEditor({
				enabled: props.decorateWorkspaceMenu,
				workspaces,
				label: props.t("editProject"),
				open: setEditTarget
			});
			(0, react.useEffect)(() => {
				if (props.open && !openRef.current) {
					setCreatePaths([]);
					setCreateTitle("");
					setCreatePrimaryPath(void 0);
					setError(void 0);
				}
				openRef.current = props.open;
			}, [props.open]);
			(0, react.useEffect)(() => {
				if (editTarget === void 0) return;
				let current = true;
				setEditTitle(editTarget.title);
				setEditPaths([editTarget.path]);
				setPrimaryPath(editTarget.path);
				setLoading(true);
				setError(void 0);
				props.get(editTarget.workspaceId).then((record) => {
					if (!current) return;
					setEditPaths(record?.paths ?? [editTarget.path]);
					setPrimaryPath(record?.primaryPath ?? editTarget.path);
				}).catch((reason) => {
					if (current) setError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					if (current) setLoading(false);
				});
				return () => {
					current = false;
				};
			}, [editTarget, props.get]);
			const addFolder = (update, onAdded) => {
				setPicking(true);
				setError(void 0);
				props.pick().then((path) => {
					if (path !== null) {
						update((current) => current.includes(path) ? current : [...current, path]);
						onAdded?.(path);
					}
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setPicking(false);
				});
			};
			const create = () => {
				if (createPrimaryPath === void 0) return;
				setCommitting(true);
				setError(void 0);
				props.createWorkspace({ path: createPrimaryPath }).then(async (workspace) => {
					await props.register(workspace.workspaceId, createPaths, createPrimaryPath);
					const title = createTitle.trim();
					if (title !== "" && title !== workspace.title) await props.renameWorkspace(workspace.workspaceId, title);
					props.onPicked(createPrimaryPath);
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setCommitting(false);
				});
			};
			const save = () => {
				if (editTarget === void 0 || primaryPath === void 0) return;
				setCommitting(true);
				setError(void 0);
				props.register(editTarget.workspaceId, editPaths, primaryPath).then(async () => {
					const title = editTitle.trim();
					if (title !== "" && title !== editTarget.title) await props.renameWorkspace(editTarget.workspaceId, title);
					setEditTarget(void 0);
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setCommitting(false);
				});
			};
			const removeProject = () => {
				if (editTarget === void 0) return;
				setCommitting(true);
				setError(void 0);
				props.deleteWorkspace(editTarget.workspaceId).then(async () => {
					await props.remove(editTarget.workspaceId);
				}).then(() => {
					setEditTarget(void 0);
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setCommitting(false);
				});
			};
			const busy = picking || loading || committing || props.busy;
			const closeEditor = () => {
				if (!committing) setEditTarget(void 0);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: props.open,
				onClose: props.onCancel,
				closeLabel: props.t("cancel"),
				title: props.t("createTitle"),
				className: MultiWorkspaceFlow_module_css_default.dialog,
				contentClassName: MultiWorkspaceFlow_module_css_default.content,
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					onClick: props.onCancel,
					children: props.t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					disabled: busy || createPaths.length === 0 || createPrimaryPath === void 0,
					onClick: create,
					children: committing ? props.t("creating") : props.t("create")
				})] }),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MultiWorkspaceFlow_module_css_default.body,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: MultiWorkspaceFlow_module_css_default.nameField,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { size: 18 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								"aria-label": props.t("name"),
								value: createTitle,
								placeholder: props.t("name"),
								onChange: (event) => {
									setCreateTitle(event.target.value);
								}
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MultiWorkspaceFlow_module_css_default.folderSection,
							"aria-label": props.t("folders"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: props.t("folders") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderList, {
								paths: createPaths,
								primaryPath: createPrimaryPath,
								busy,
								removable: false,
								primarySelectable: true,
								t: props.t,
								onRemove: () => {},
								onPrimary: setCreatePrimaryPath,
								onAdd: () => {
									addFolder(setCreatePaths, (path) => {
										setCreatePrimaryPath((current) => current ?? path);
									});
								}
							})]
						}),
						error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MultiWorkspaceFlow_module_css_default.error,
							role: "alert",
							children: error
						})
					]
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: editTarget !== void 0,
				onClose: closeEditor,
				closeLabel: props.t("cancel"),
				title: props.t("editTitle"),
				className: MultiWorkspaceFlow_module_css_default.dialog,
				contentClassName: MultiWorkspaceFlow_module_css_default.content,
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MultiWorkspaceFlow_module_css_default.editFooter,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: MultiWorkspaceFlow_module_css_default.danger,
						disabled: busy,
						onClick: removeProject,
						children: props.t("removeProject")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: MultiWorkspaceFlow_module_css_default.footerActions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							onClick: closeEditor,
							children: props.t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: busy || editPaths.length === 0 || editTitle.trim() === "" || primaryPath === void 0,
							onClick: save,
							children: committing ? props.t("saving") : props.t("save")
						})]
					})]
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: MultiWorkspaceFlow_module_css_default.body,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: MultiWorkspaceFlow_module_css_default.nameField,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { size: 18 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								"aria-label": props.t("name"),
								value: editTitle,
								placeholder: props.t("name"),
								disabled: busy,
								onChange: (event) => {
									setEditTitle(event.target.value);
								}
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: MultiWorkspaceFlow_module_css_default.folderSection,
							"aria-label": props.t("folders"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: props.t("folders") }), loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: MultiWorkspaceFlow_module_css_default.status,
								role: "status",
								children: props.t("loading")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderList, {
								paths: editPaths,
								primaryPath,
								busy,
								removable: true,
								primarySelectable: true,
								t: props.t,
								onRemove: (path) => {
									setEditPaths((current) => current.filter((item) => item !== path));
								},
								onPrimary: setPrimaryPath,
								onAdd: () => {
									addFolder(setEditPaths);
								}
							})]
						}),
						error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: MultiWorkspaceFlow_module_css_default.error,
							role: "alert",
							children: error
						})
					]
				})
			})] });
		}
		// src/client/locales.ts
		const zh = {
			createTitle: "创建项目",
			editTitle: "编辑项目",
			editProject: "编辑项目",
			name: "项目名称",
			folders: "源文件夹",
			add: "添加文件夹",
			remove: "移除文件夹",
			empty: "添加 Codex 可读取和编辑的文件夹",
			cancel: "取消",
			create: "创建项目",
			creating: "正在创建…",
			save: "保存更改",
			saving: "正在保存…",
			loading: "正在读取源文件夹…",
			primary: "主要",
			setPrimary: "设为主要",
			removeProject: "移除本地项目",
			error: "无法更新项目"
		};
		const en = {
			createTitle: "Create project",
			editTitle: "Edit project",
			editProject: "Edit project",
			name: "Project name",
			folders: "Source folders",
			add: "Add folder",
			remove: "Remove folder",
			empty: "Add folders Codex can read and edit",
			cancel: "Cancel",
			create: "Create project",
			creating: "Creating…",
			save: "Save changes",
			saving: "Saving…",
			loading: "Loading source folders…",
			primary: "Primary",
			setPrimary: "Set as primary",
			removeProject: "Remove local project",
			error: "Could not update project"
		};
		// src/client/index.ts
		const NS = "multi-workspace";
		const UI_INJECT = [
			"remote",
			"remote.multiWorkspace",
			"workspaces",
			"slots",
			"locale"
		];
		/** Register the dialog only after its mounted Remote namespace is injectable. */
		function registerMultiWorkspace(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "multi-workspace: dictionaries");
			const injected = (decorateWorkspaceMenu) => () => ({
				pick: () => ctx.workspaces.pickDirectory(),
				get: async (workspaceId) => {
					const result = await ctx.remote.multiWorkspace.get(workspaceId);
					if (!result.ok) throw new Error(result.error.message);
					return result.value;
				},
				remove: async (workspaceId) => {
					const result = await ctx.remote.multiWorkspace.delete(workspaceId);
					if (!result.ok) throw new Error(result.error.message);
				},
				register: async (workspaceId, paths, primaryPath) => {
					const result = await ctx.remote.multiWorkspace.register(workspaceId, paths, primaryPath);
					if (!result.ok) throw new Error(result.error.message);
				},
				createWorkspace: (input) => ctx.workspaces.create(input),
				renameWorkspace: async (workspaceId, title) => {
					await ctx.workspaces.rename(workspaceId, title);
				},
				deleteWorkspace: async (workspaceId) => {
					await ctx.workspaces.delete(workspaceId);
				},
				decorateWorkspaceMenu
			});
			ctx.slots.inject("conversation.hero.workspace.directoryFlow", () => ctx.slots.inject("sidebar.workspaces.directoryFlow", function* () {
				yield ctx.slots.register({
					name: "conversation.hero.workspace.directoryFlow",
					priority: -10,
					inject: injected(false),
					locale: NS
				}, MultiWorkspaceFlow);
				yield ctx.slots.register({
					name: "sidebar.workspaces.directoryFlow",
					priority: -10,
					inject: injected(true),
					locale: NS
				}, MultiWorkspaceFlow);
			}));
		}
		/** Required service for mounting the plugin-owned Remote contribution. */
		const inject = ["remote"];
		/** Mount the Remote contribution before starting its UI consumer. */
		async function apply(ctx) {
			await ctx.remote.$mount(TYPERT_REMOTE);
			await ctx.inject(UI_INJECT, registerMultiWorkspace);
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map