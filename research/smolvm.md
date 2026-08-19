# Smol Machines / smolvm research

Research date: 2026-08-19

## Scope and source policy

This report uses only the requested first-party sources: the [smolvm repository](https://github.com/smol-machines/smolvm), the [Smol Machines home page](https://smolmachines.com/), the [local SDK guide](https://smolmachines.com/docs/sdk/with-local), the [Kubernetes guide](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm), the [agent sandboxes and CI guide](https://smolmachines.com/docs/guides/agent-sandboxes-ci), the [Docker-in-a-machine guide](https://smolmachines.com/docs/guides/docker-in-a-machine), and the [local examples](https://smolmachines.com/docs/local/examples). “Documented” means stated by those sources. “Inference” means an engineering conclusion drawn from them.

## What it is

**Documented:** Smol Machines presents the same SDK and `.smolmachine` artifact as usable locally, in its cloud, or self-hosted. `smolvm` is the open-source local runtime/CLI behind the local and self-hosted path. Its basic unit is a fast, isolated Linux VM rather than a process-level container. ([home](https://smolmachines.com/), [repository](https://github.com/smol-machines/smolvm))

**Inference:** The useful product boundary is “run an OCI-described workload behind a VM boundary with a portable workflow,” not “replace Docker for every container workload.” Docker is optional unless software inside the guest needs to call a Docker daemon. ([repository](https://github.com/smol-machines/smolvm), [Docker guide](https://smolmachines.com/docs/guides/docker-in-a-machine))

## Architecture and runtime

The documented runtime path is:

```text
OCI image or Smolfile
        |
        v
smolvm + libkrun VMM + libkrunfw guest kernel
        |
        v
hardware-virtualized Linux VM with its own guest kernel
```

**Documented facts:**

- Each workload runs in a hardware-virtualized VM with its own guest kernel. The backend is Hypervisor.framework on macOS, KVM on Linux, or Windows Hypervisor Platform on Windows; `libkrun` is the VMM and `libkrunfw` supplies the guest kernel. ([repository](https://github.com/smol-machines/smolvm))
- OCI images are supported directly, including images from Docker Hub, GitHub Container Registry, and other OCI registries; a Docker daemon is not required just to boot an image. A `.smolmachine` pack is intended to run when the host architecture is compatible. ([repository](https://github.com/smol-machines/smolvm))
- The defaults documented by the repository are 4 vCPUs and 8 GiB RAM. Memory is elastic through virtio ballooning, and vCPU threads sleep in the hypervisor when idle; `--cpus` and `--mem` override the defaults. ([repository](https://github.com/smol-machines/smolvm))
- A Smolfile is TOML for VM configuration: image, resources, network policy, mounts, ports, environment, initialization, storage, and related options. Unknown keys are rejected at create time. ([repository](https://github.com/smol-machines/smolvm))

**Inference:** This architecture is a good fit when guest-kernel isolation, nested container tooling, or reproducible VM-shaped environments matters more than the smallest possible process startup overhead. It is a poor default for workloads that only need ordinary container isolation and already fit a standard container runtime.

## Prerequisites and platform coverage

The home page documents this support matrix:

| Host | Guest | Requirement |
| --- | --- | --- |
| macOS Apple Silicon | arm64 Linux | macOS 11+ |
| macOS Intel | x86_64 Linux | macOS 11+; marked untested |
| Linux x86_64 | x86_64 Linux | KVM and `/dev/kvm` |
| Linux aarch64 | aarch64 Linux | KVM and `/dev/kvm` |
| Windows x86_64 | x86_64 Linux | WHP enabled; release ZIP |

([platform support](https://smolmachines.com/), [installation](https://github.com/smol-machines/smolvm))

For macOS and Linux, the repository documents an installer script or GitHub Releases; Windows requires the `windows-x86_64` release ZIP and the Windows Hypervisor Platform feature. ([installation](https://github.com/smol-machines/smolvm))

## Local SDK usage

**Documented:** The npm package and Python wheel include the local runtime libraries, boot helper, and guest root filesystem. A separate `smolvm` CLI, `smolvm serve`, or background daemon is not required for SDK use; `Machine.create()` boots the embedded engine in-process. Select the local target explicitly in JavaScript or Python:

```js
import { Machine } from "smolmachines";

const machine = await Machine.create(
  { resources: { cpus: 2, memoryMb: 1024 } },
  { target: "local" },
);
```

```python
from smol import ConnectOptions, Machine, MachineConfig, ResourceSpec

machine = Machine.create(
    MachineConfig(resources=ResourceSpec(cpus=2, memory_mb=1024)),
    ConnectOptions(target="local"),
)
```

([SDK local target](https://smolmachines.com/docs/sdk/with-local))

The local SDK can run an OCI image and command, cache images with `pullImage()`/`pull_image()`, list cached images, and bind an absolute host directory into the guest. Guest networking is off by default; enable it only when the workload needs DNS or outbound access. Local services use host-to-guest port publishing and a host port, while `endpoint()` and the public `url()` workflow require the cloud control plane. ([SDK local target](https://smolmachines.com/docs/sdk/with-local))

Mounts are writable by default. The SDK guide recommends exposing only required paths, using read-only mounts when possible, and expecting files created through writable mounts to be owned according to the guest process, potentially as root on the host. A mount at `/workspace` replaces the machine’s default storage-disk workspace for that path. ([SDK local target](https://smolmachines.com/docs/sdk/with-local))

## Kubernetes

The Kubernetes guide documents two distinct layouts:

| Layout | Boundary and use |
| --- | --- |
| VM per pod | An experimental containerd shim starts each selected pod in its own smolvm; intended for hardware isolation between selected pods. |
| Cluster in one machine | k3s or k3d, including control plane, kubelet, runtime, and workloads, runs inside one smolvm; intended for disposable local clusters, CI, and control-plane tests. |

([Kubernetes guide](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm))

For VM-per-pod mode, Kubernetes remains outside smolvm and selected pods use a `RuntimeClass`; the guide calls the shim experimental, says it was introduced in smolvm v1.6.0, and says it was validated with k3s. The guide recommends evaluating it in a test cluster and checking version-specific deployment instructions before production. ([Kubernetes guide](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm))

For a cluster inside one machine, the guest owns its kernel, cgroup v2 hierarchy, netfilter rules, mounts, and overlayfs. The guide also documents `/dev/kmsg` as required for kubelet startup in nested k3s/k3d; smolvm exposes the guest kernel log device, while neighboring smolvms have separate kernels. ([Kubernetes guide](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm))

**Inference:** Choose VM-per-pod when the primary requirement is a stronger pod boundary in an existing cluster. Choose one cluster per VM when the requirement is a disposable, self-contained Kubernetes test environment. These are different operating models, not interchangeable deployment flags.

## Agent sandboxes and CI

The CI guide defines four lifecycles:

- **Ephemeral run:** create, run one command, delete; suited to untrusted scripts, CI jobs, and one agent turn.
- **Persistent machine:** retain disk state across stop/start; suited to development agents and jobs needing later inspection.
- **Pack:** prebuild dependencies into a portable `.smolmachine`; suited to repeated jobs on compatible host architectures.
- **Fork:** clone a running golden machine with copy-on-write RAM and disk; suited to many short workers from one warm state.

([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci))

The guide recommends mounting source trees read-only and placing generated output in a separate writable directory. Network access is off unless enabled; hostname and CIDR allow lists can narrow egress, but there is no first-class deny-list. ([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci))

Packs avoid repeating image pulls and setup but require a compatible host architecture. Forks use copy-on-write RAM and disk, share a frozen base, and remain tied to the golden machine’s host and architecture. Persistent workers must be deleted on every path; SDK callers should use `finally` or the Python context manager, and cloud jobs should use a TTL where available. ([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci))

Secrets are a major boundary decision: secret-env injection puts plaintext into the guest, and SSH-agent forwarding keeps private key material on the host but lets guest code request signatures while the socket is connected. The guide says there is no shipped general HTTP credential broker or cloud-native secrets store, and recommends short-lived, least-privilege credentials for one job. ([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci))

## Docker inside a machine

**Documented:** smolvm can boot OCI images without Docker. Use Docker-in-a-machine only when the guest workload must call Docker, such as Testcontainers, Docker Compose, image builds, or an agent that launches containers. The documented setup runs `dockerd` inside the guest, stores Docker data on the guest’s ext4 storage disk, and uses `overlay2`. ([Docker guide](https://smolmachines.com/docs/guides/docker-in-a-machine))

With `docker_socket = true` in a Smolfile or `--docker-socket`, smolvm bridges the guest Docker socket over vsock and prints a host-side Unix socket path. A host Docker client can use that path with `DOCKER_HOST`; the host socket is not mounted into the guest. ([Docker guide](https://smolmachines.com/docs/guides/docker-in-a-machine))

The security distinction is material: exposing the guest daemon lets host clients control a daemon whose containers remain under the guest kernel, whereas exposing the host Docker socket lets guest code control the host daemon and defeats the expected isolation. The guide recommends the vsock-backed Unix socket and warns against an unauthenticated Docker TCP API on `0.0.0.0`. ([Docker guide](https://smolmachines.com/docs/guides/docker-in-a-machine))

## Local examples

The examples page says its commands use the v1.7.1 nested CLI and recommends checking `smolvm COMMAND --help` against the installed version. Its examples cover:

- ephemeral `machine run` with an OCI image and no network by default;
- publishing a guest HTTP port with `--net` and `--port 8000:8000`;
- creating a persistent Python machine, starting it, installing a package, stopping it, and starting it again later;
- copying code into and results out of a persistent machine with `machine cp`;
- packing a preinstalled Python runtime and invoking the generated pack.

The page recommends a volume mount instead of `machine cp` for transfers at or above 4 GiB. ([local examples](https://smolmachines.com/docs/local/examples))

## Limits and security-relevant caveats

The repository’s documented limitations and security model should be treated as operational requirements:

- Networking is opt-in and supports TCP/UDP, not ICMP. Port forwarding and host services expand the workload’s reachable surface. ([known limitations](https://github.com/smol-machines/smolvm), [security model](https://github.com/smol-machines/smolvm))
- Volume mounts expose requested host directories intentionally; the documented mount model is directories, not individual files. Do not mount secrets or sensitive paths into untrusted workloads. ([known limitations](https://github.com/smol-machines/smolvm), [security model](https://github.com/smol-machines/smolvm))
- Local CLI and VMM processes run with the invoking host user’s permissions. The repository says smolvm is not itself a hardened multi-user control plane and recommends host account separation and OS confinement for hostile local co-tenants. ([security model](https://github.com/smol-machines/smolvm))
- On macOS, the binary needs Hypervisor.framework entitlements; re-signing or rebuilding without them causes VM start failure. SSH-agent forwarding requires a host agent and `SSH_AUTH_SOCK`. ([known limitations](https://github.com/smol-machines/smolvm))
- GPU support requires a libkrun build with GPU support plus virglrenderer and a Vulkan driver. Windows does not currently have GPU acceleration or machine fork/snapshot; pack creation also needs template ext4 files beside `smolvm.exe`. ([known limitations](https://github.com/smol-machines/smolvm))
- Release archives publish SHA-256 checksums, but the repository says releases are not currently signed or accompanied by provenance attestations, and installation can proceed if the checksum file cannot be downloaded. ([security model](https://github.com/smol-machines/smolvm))

**Inference:** Treat guest root as untrusted, keep mounts narrow and preferably read-only, leave networking disabled unless needed, scope egress and credentials per job, and clean up persistent machines even after failures. Those controls follow directly from the capabilities the docs say are explicitly forwarded and from the CI cleanup guidance.

## Decision summary

| Need | Decision |
| --- | --- |
| Run ordinary OCI workloads locally with a VM boundary | Use smolvm directly; Docker is unnecessary. ([repository](https://github.com/smol-machines/smolvm)) |
| Build a local application integration around the runtime | Use the local SDK; it embeds the engine and supports OCI execution, mounts, and local port publishing. ([SDK local target](https://smolmachines.com/docs/sdk/with-local)) |
| Run untrusted agent turns or CI jobs | Prefer ephemeral machines, read-only source mounts, narrow egress, short-lived credentials, and unconditional cleanup. ([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci)) |
| Repeated high-fan-out jobs | Use a compatible pack for portable cold starts or a forkable golden machine for same-host warm workers. ([agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci)) |
| Need Kubernetes | Use VM-per-pod only after validating the experimental shim; use a cluster-in-one-machine layout for disposable nested k3s/k3d testing. ([Kubernetes guide](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm)) |
| Need Docker APIs inside the workload | Run Docker inside the guest and expose only the guest daemon socket; never mount the host Docker socket into an untrusted guest. ([Docker guide](https://smolmachines.com/docs/guides/docker-in-a-machine)) |

Overall, **documented facts** support smolvm as a compact VM-isolation runtime with a consistent local/cloud/self-hosted artifact model. The **inference** is that its strongest default use cases are agent sandboxes, CI isolation, nested container tooling, and reproducible disposable environments; platform support, experimental Kubernetes integration, host capability forwarding, and the local multi-user security caveat should be resolved before adopting it as a general-purpose production substrate.
