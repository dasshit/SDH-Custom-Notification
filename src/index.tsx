import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";

import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  // const [result, setResult] = useState<number | undefined>();

  // const onClick = async () => {
  //   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
  //     "add",
  //     {
  //       left: 2,
  //       right: 2,
  //     }
  //   );
  //   if (result.success) {
  //     setResult(result.result);
  //   }
  // };

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e: Event) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => {}}>
                <MenuItem onSelected={() => {}}>Item #1</MenuItem>
                <MenuItem onSelected={() => {}}>Item #2</MenuItem>
                <MenuItem onSelected={() => {}}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
        Go to Library
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {

    let delay: number = 10;

    const fetchToasts = (serverAPI: ServerAPI) => {
        serverAPI.callPluginMethod(
            "get_toasts",
            {}
        )
        .then(
            response => {
                console.log(
                    '[get_toasts]',
                    response,
                    (response.result as any).body
                )
                return JSON.parse(response.result as string)
            }
        ).then(
            data => {
                delay = 10;
                for (let entry of data) {
                    console.log(
                        '[get_toasts]',
                        `Got toast: ${entry}`
                    )
                    serverAPI.toaster.toast(entry)
                }
                timeout = setTimeout(() => {
                    fetchToasts(serverApi)
                }, delay);
            }
        ).catch(
            error => {
                delay = delay * 2;
                console.error(
                    '[get_toasts]',
                    error
                )
                timeout = setTimeout(() => {
                    fetchToasts(serverApi)
                }, delay);
            }
        );
    }

    let timeout = setTimeout(() => {
        fetchToasts(serverApi)
    }, delay);

  return {
    title: <div className={staticClasses.Title}>Custom notifications</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
        clearTimeout(timeout)
    }
  };
});
